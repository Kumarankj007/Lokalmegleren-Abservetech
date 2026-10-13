// Shared types for the PDF brochure viewer.

/** Props for the Flipbook viewer component. */
export interface FlipbookProps {
  /** Rendered page images (PNG data URLs) produced by pdfhtml.tsx. */
  images: string[];
  /** Triggers download of the original PDF. */
  generatePDF: () => void;
  isMobile: boolean;
  isLoadDownload: boolean;
}

/**
 * Event payload emitted by `page-flip` on its `flip` event. The library types
 * `data` as `unknown`; for the `flip` event it is the zero-based page index.
 */
export interface FlipEvent {
  data: unknown;
}
