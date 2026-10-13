import { useState, useEffect } from "react";

import { fetchDocumentImages } from "@/services/global";

export function useDocumentImages(id: string | null) {
  const [documentImages, setDocuments] = useState<string[]>([]);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [_error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setDocuments([]);
    setError(null);
    setIsLoadingDoc(true);
    const buffer: string[] = [];
    let rafId: number | null = null;
    let completed = false;
    const flush = () => { if (buffer.length === 0) return; const batch = buffer.splice(0); setDocuments((prev) => [...prev, ...batch]); };
    const scheduleFlush = () => { if (rafId !== null) return; rafId = requestAnimationFrame(() => { rafId = null; flush(); }); };
    fetchDocumentImages({
      tenantId: 381, propertyId: id || 3000006, signal: controller.signal,
      onDocument: (doc) => { buffer.push(...doc.images); scheduleFlush(); },
      onProgress: (done, total) => { setProgress({ done, total }); if (done >= total) completed = true; },
      onError: (err) => setError(err),
    })
      .catch(() => { })
      .finally(() => {
        if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
        flush();
        if (completed || !controller.signal.aborted) setIsLoadingDoc(false);
      });
    return () => { controller.abort(); if (rafId !== null) cancelAnimationFrame(rafId); };
  }, [id]);

  return { documentImages, isLoadingDoc, progress };
}
