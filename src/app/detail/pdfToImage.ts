import { PDF_WORKER_SRC } from "../pdf-viewer/constants";

/**
 * Renders a PDF blob to base64 PNGs, one per page.
 *
 * pdfjs-dist v5 is browser-only - importing it at module scope ran its
 * top-level code during SSR, which threw ("Object.defineProperty called on
 * non-object") and forced the whole accordion to fall back to client
 * rendering. Importing it inside the function keeps it off the server
 * entirely, and out of the initial client bundle until a PDF is opened.
 */
export const pdfToBase64Images = async (blob: Blob): Promise<string[]> => {
  const pdfjsLib = await import("pdfjs-dist");
  // Shared with the brochure viewer so the two can't drift onto different
  // worker versions.
  pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;

  const arrayBuffer = await blob.arrayBuffer();

  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
  }).promise;

  const images: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);

    const viewport = page.getViewport({ scale: 2 });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvas,
      canvasContext: context,
      viewport,
    }).promise;

    images.push(canvas.toDataURL("image/png"));
  }

  return images;
};
