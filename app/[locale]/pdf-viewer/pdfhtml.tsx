"use client";

import { useEffect, useState } from "react";

import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import Flipbook from "./FlipBook";
import Loader from "@/components/loader2";
import { useSearchParams } from "next/navigation";
import { downloadFn } from "@/utils/helper";
import {
  A3_RATIO_MAX,
  A3_RATIO_MIN,
  PAGE_IMAGE_MIME,
  PDF_RENDER_SCALE,
  PDF_WORKER_SRC,
} from "./constants";

GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;

/**
 * Crops a horizontal region from `source` into a new canvas and returns it as a
 * data URL. Returns the full source as-is if a 2D context can't be created.
 */
function cropCanvas(
  source: HTMLCanvasElement,
  sx: number,
  width: number,
): string {
  const target = document.createElement("canvas");
  target.width = width;
  target.height = source.height;

  const ctx = target.getContext("2d");
  if (!ctx) return source.toDataURL(PAGE_IMAGE_MIME);

  ctx.drawImage(
    source,
    sx,
    0,
    width,
    source.height,
    0,
    0,
    width,
    source.height,
  );
  return target.toDataURL(PAGE_IMAGE_MIME);
}

export default function PdfToImages() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") || "";
  const id = searchParams.get("id") || "";
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPdf = async () => {
    try {
      setLoading(true);
      const pdf = await getDocument(process.env.NEXT_PUBLIC_SITE_URL + url)
        .promise;

      const pages: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: PDF_RENDER_SCALE });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;

        // Only A3 landscape pages (ratio ≈ 1.413) are split.
        // A4 single pages (ratio ≈ 0.707) and any other size stay whole.
        const ratio = viewport.width / viewport.height;
        const isA3Spread = ratio > A3_RATIO_MIN && ratio < A3_RATIO_MAX;

        if (isA3Spread) {
          const half = canvas.width / 2;
          pages.push(cropCanvas(canvas, 0, half));
          pages.push(cropCanvas(canvas, half, half));
        } else {
          pages.push(canvas.toDataURL(PAGE_IMAGE_MIME));
        }
      }

      setImages(pages);
    } catch (error) {
      console.error("PDF render error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPdf();
  }, [url]);

  const generatePDF = async () => {
    await downloadFn(process.env.NEXT_PUBLIC_SITE_URL + url, "property-" + id);
  };

  if (loading) {
    return <Loader message="Laster inn pdf-filen..." />;
  }

  return (
    <div style={{ margin: "0 auto" }}>
      {images?.length > 0 ? (
        <Flipbook images={images} generatePDF={generatePDF} />
      ) : (
        <div>No Pages</div>
      )}
    </div>
  );
}
