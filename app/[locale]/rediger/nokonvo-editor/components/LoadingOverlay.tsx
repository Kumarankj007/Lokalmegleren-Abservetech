"use client";

import Loader from "@/components/loader2";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";

interface LoadingOverlayProps {
  isLoading: boolean;
  pendingPDF?: boolean;
  pendingSaveHtml?: boolean;
  pendingSync?: boolean;
}

export default function LoadingOverlay({ isLoading, pendingPDF, pendingSaveHtml, pendingSync }: LoadingOverlayProps) {
  if (!(isLoading || pendingPDF || pendingSaveHtml || pendingSync)) return null;
  return (
    <Dialog open={isLoading || pendingPDF || pendingSaveHtml || pendingSync}>
      <DialogOverlay className="bg-black/10 backdrop-blur-xs" />
      <DialogContent className="w-full bg-transparent border-none text-text-light p-0" hideClose>
        <Loader className="h-full text-white" message={isLoading ? "Laster inn filen ..." : pendingPDF ? "Genererer PDF..." : pendingSync ? "Synkroniser fra Webmegler..." : "Lagrer HTML..."} />
      </DialogContent>
    </Dialog>
  );
}
