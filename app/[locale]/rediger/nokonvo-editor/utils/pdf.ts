import { A4_W, A4_H } from "../constants";
import type { Page, CanvasElement } from "../types";
import { genId, defaultElement } from "./factories";
import { cropImageVerticalPixels } from "./image";

interface RenderedPdfPage {
  src: string;
  width: number;
  height: number;
}

export async function pdfToPageImages(file: File): Promise<RenderedPdfPage[]> {
  // @ts-ignore — pdfjs-dist types are resolved in the host project, not here.
  const pdfjs: any = await import("pdfjs-dist/legacy/build/pdf");

  if (pdfjs.GlobalWorkerOptions && !pdfjs.GlobalWorkerOptions.workerSrc) {
    try {
      pdfjs.GlobalWorkerOptions.workerSrc = await import(
        // @ts-ignore — bundler-resolved URL
        "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url"
      ).then((m: any) => m.default);
    } catch {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
    }
  }

  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buf }).promise;

  const out: RenderedPdfPage[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = A4_W / baseViewport.width;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get 2D canvas context");

    await page.render({ canvasContext: ctx, viewport }).promise;
    out.push({
      src: canvas.toDataURL("image/jpeg", 0.85),
      width: canvas.width,
      height: canvas.height,
    });
  }
  return out;
}

export async function pagesFromPdf(file: File): Promise<Page[]> {
  const rendered = await pdfToPageImages(file);
  const baseName = file.name.replace(/\.pdf$/i, "");
  const pages: Page[] = [];
  let position = 0;

  const makeImageEl = (src: string, height: number): CanvasElement => ({
    ...defaultElement("image"),
    id: genId("image"),
    src,
    x: 0,
    y: 0,
    width: A4_W,
    height,
    objectFit: "fill",
    zIndex: 0,
  });

  const makePage = (src: string, imgHeight: number): Page => {
    position += 1;
    return {
      id: genId("page"),
      name: `${baseName} · ${position}`,
      bg: "#ffffff",
      width: A4_W,
      height: A4_H,
      loop: null,
      elements: [makeImageEl(src, imgHeight)],
    };
  };

  for (const { src, height: renderedHeight } of rendered) {
    if (renderedHeight <= A4_H) { pages.push(makePage(src, renderedHeight)); continue; }
    const numSlices = Math.ceil(renderedHeight / A4_H);
    for (let s = 0; s < numSlices; s++) {
      const startY = s * A4_H;
      const endY = Math.min(renderedHeight, (s + 1) * A4_H);
      const slicedSrc = await cropImageVerticalPixels(src, startY, endY);
      pages.push(makePage(slicedSrc, endY - startY));
    }
  }
  return pages;
}
