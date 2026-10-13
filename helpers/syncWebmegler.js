import { syncAll, syncTextFromWebmegler } from "../controllers/sync-text-from-webmegler.js";
import axios from 'axios'
import pLimit from "p-limit";
import fs from 'fs'
import path from "path"
import { execFile } from 'child_process'
import { promisify } from 'util'
import os from 'os'
const execFileP = promisify(execFile)

const axiosGetWithRetry = async (url, config = {}, { retries = 3, baseDelayMs = 1000 } = {}) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            // timeout guarantees axios can never hang forever
            return await axios.get(url, { timeout: 15000, ...config })
        } catch (err) {
            const status = err.response?.status
            const isTimeout = err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT'
            const retryable = status === 429 || status === 503 || isTimeout
            const isLast = attempt === retries

            if (!retryable || isLast) throw err

            const retryAfter = err.response?.headers?.['retry-after']
            let waitMs
            if (retryAfter) {
                const asNum = Number(retryAfter)
                waitMs = Number.isNaN(asNum)
                    ? Math.max(0, new Date(retryAfter).getTime() - Date.now())
                    : asNum * 1000
            } else {
                waitMs = baseDelayMs * 2 ** attempt + Math.floor(Math.random() * 250)
            }

            console.warn(`[sync] ${status || err.code} from ${url} — retry ${attempt + 1}/${retries} in ${waitMs}ms`)
            await new Promise(r => setTimeout(r, waitMs))
        }
    }
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const fetchPdfBuffer = async (propertyId, documentId, token, maxAttempts = 5) => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const url = `https://api.webmegler.no/app/381/1.0/oppdrag/${propertyId}/dokumenter/${documentId}/pdffile`
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'arraybuffer',
                timeout: 20000
            })
            return Buffer.from(response.data)
        } catch (error) {
            const status = error?.response?.status
            if (status === 429 && attempt < maxAttempts) {
                await sleep(800 * attempt)
                continue
            }
            if (attempt < maxAttempts && (!status || status >= 500)) {
                await sleep(400 * attempt)
                continue
            }
            console.log(`  ✗ Fetch failed ${documentId} (status: ${status || 'no response'})`)
            return null
        }
    }
    return null
}

const convertPdfToBase64Fast = async (pdfBuffer, documentId) => {
    // Unique temp directory per call — auto-cleaned at the end
    const tmpDir = await fs.promises.mkdtemp(
        path.join(os.tmpdir(), `pdfconv-${documentId}-`)
    )
    const tmpPdf = path.join(tmpDir, 'in.pdf')
    const prefix = path.join(tmpDir, 'page')
    try {
        await fs.promises.writeFile(tmpPdf, pdfBuffer)
        // -jpeg            → JPEG output (smaller + faster than PNG)
        // -r 100           → 100 DPI; tune 80–120
        // -jpegopt quality → 75 is the sweet spot for documents
        await execFileP('pdftoppm', [
            '-jpeg',
            '-r', '100',
            '-jpegopt', 'quality=75',
            tmpPdf,
            prefix
        ], { timeout: 60000 })
        // Collect generated JPEGs in correct page order
        const files = (await fs.promises.readdir(tmpDir))
            .filter(f => f.startsWith('page-') && f.endsWith('.jpg'))
            .sort((a, b) => {
                const na = parseInt(a.match(/-(\d+)\.jpg$/)?.[1] || '0', 10)
                const nb = parseInt(b.match(/-(\d+)\.jpg$/)?.[1] || '0', 10)
                return na - nb
            })
        // Read each file → base64 data URI (in parallel)
        const images = await Promise.all(files.map(async f => {
            const buf = await fs.promises.readFile(path.join(tmpDir, f))
            return `data:image/jpeg;base64,${buf.toString('base64')}`
        }))
        console.log(`  → Document ${documentId}: ${images.length} page(s) converted`)
        return images
    } catch (error) {
        console.log(`Failed to convert PDF ${documentId}:`, error.message)
        return []
    } finally {
        // Always clean up temp dir, never leave artifacts on disk
        fs.promises.rm(tmpDir, { recursive: true, force: true }).catch(() => { })
    }
}

const getDocumentImages = async (propertyId, token) => {
    const headers = {
        Authorization: `Bearer ${token}`
    };

    const { data: allDocuments } = await axios.get(
        `https://api.webmegler.no/app/381/1.0/oppdrag/${propertyId}/dokumenter`,
        { headers }
    );

    const pdfDocuments = (allDocuments || []).filter(
        doc =>
            doc.filtype === "pdf" &&
            doc.kategori === "Diverse til salgsoppgave"
    );


    const fetchLimit = pLimit(3);
    const convertLimit = pLimit(Math.max(2, os.cpus().length));

    const documentImages = [];

    await Promise.all(
        pdfDocuments.map(doc =>
            fetchLimit(async () => {
                const buffer = await fetchPdfBuffer(propertyId, doc.id, token);
                if (!buffer) return;

                const images = await convertLimit(() =>
                    convertPdfToBase64Fast(buffer, doc.id)
                );

                if (!images.length) return;

                documentImages.push({
                    id: doc.id,
                    navn: doc.navn,
                    kategori: doc.kategori,
                    totalPages: images.length,
                    images
                });
            })
        )
    );
    return documentImages;
};

const syncPropertyData = async ({ propertyId, token, html }, img = true) => {
    const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    const detailUrl = `https://api.webmegler.no/app/381/1.0/oppdrag/${propertyId}`
    const imageUrl = `https://api.webmegler.no/app/381/1.0/oppdrag/${propertyId}/bilder`

    const [detail, brief, images = [], documentImages = []] = await Promise.all(img ? [
        axiosGetWithRetry(detailUrl, { headers }),
        axiosGetWithRetry(`${detailUrl}/salgsoppgavetekster`, { headers }),
        axiosGetWithRetry(imageUrl, { headers }),
        getDocumentImages(propertyId, token)
    ] : [
        axiosGetWithRetry(detailUrl, { headers }),
        axiosGetWithRetry(`${detailUrl}/salgsoppgavetekster`, { headers }),
        axiosGetWithRetry(imageUrl, { headers }),
    ]);

    const propertyImages = images.data?.filter(img => !img.slettet) ?? [];

    const getMeglerImage = async (employeeId) => {
        try {
            const url = `https://api.webmegler.no/app/381/1.0/ansatte/${employeeId}/profilbilde`
            const response = await axios.get(url, { headers, responseType: 'arraybuffer', timeout: 15000 })
            const base64Image = Buffer.from(response.data, 'binary').toString('base64')
            return `data:image/jpeg;base64,${base64Image}`
        } catch (error) {
            console.log(`[sync] Failed to fetch megler image for employee ${employeeId}`)
            return null
        }
    }
    const [megler1Image, megler2Image] = await Promise.all([
        detail.data?.megler1?.id ? getMeglerImage(detail.data.megler1.id) : null,
        detail.data?.megler2?.id ? getMeglerImage(detail.data.megler2.id) : null
    ]);

    if (detail.data?.megler1) detail.data.megler1.profilbilde = megler1Image
    if (detail.data?.megler2) detail.data.megler2.profilbilde = megler2Image

    const result = syncAll(
        html,
        detail.data,
        brief.data,
        propertyImages,
        documentImages,
        img
    );

    console.log('[sync] adresse:', detail.data?.eiendom?.adresse);
    console.log('[sync] prisantydning:', detail.data?.prisantydning);

    return {
        detail: detail.data,
        brief: brief.data,
        propertyImages,
        documentImages,
        updatedHtml: result.html,
        changed: result.changed,
        skipped: result.skipped
    };
};

export { syncPropertyData }