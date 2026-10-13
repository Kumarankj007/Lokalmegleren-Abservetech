"use client";

import { useEffect, useState, useTransition } from "react";

import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import Flipbook from "./FlipBook";
import { useSearchParams } from "next/navigation";
import {
  A3_RATIO_MAX,
  A3_RATIO_MIN,
  PAGE_IMAGE_MIME,
  PDF_RENDER_SCALE,
  PDF_WORKER_SRC,
} from "./constants";
import { pdfToBase64Images } from "../detail/pdfToImage";
import { API } from "../helper/apitoolspdf";
import { Loader, Loader2 } from "lucide-react";
import Image from "next/image";
import ImageComponent from "../components/ImageComponent";

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

const downloadFn = async (fileUrl: string, fileName: string) => {
  if (!fileUrl || fileUrl == "") return
  const res = await fetch(fileUrl);

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName + ".pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  return true;
};

export default function PdfToImages() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") || "";
  const id = searchParams.get("id") || "";
  const propertyId: any = searchParams.get("propertyId");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoadDownload, startDownload] = useTransition();

  // isMobile function
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind md breakpoint
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const pdflink = async (download = false) => {
    // console.log("PDF ID:", id);

    try {
      if (!id || !propertyId) {
        alert("Missing document ID or property ID. Cannot fetch PDF.");
        setLoading(false);
        return;
      }
      const blob = await API?.GETPDF(`api/webmegler/file/document/${id}`, {
        tenantId: "381",
        propertyId,
      });

      if (!blob || !(blob instanceof Blob)) {
        alert("PDF download failed: Invalid response from server.");
        setLoading(false);
        return;
      }
      if (!download) {
        const base64Images = await pdfToBase64Images(blob);
        setImages(base64Images);
        setLoading(false);
      } else {
        // Create a download URL and open in new tab
        const url = window?.URL?.createObjectURL(blob);
        window?.open(url, "_blank");

        // ✅ 2. Also trigger download
        const link = document.createElement("a");
        link.href = url;
        link.download = `document-${id}.pdf`; // ← Optional: customize filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Optional: clean up memory
      }


    } catch (error) {
      setLoading(false);
      alert("Failed to fetch or open PDF. Please check your network or try again later.");
      console.error("Failed to fetch or open PDF:", error);
    }
  };

  // const loadPdf = async () => {
  //   try {
  //     setLoading(true);
  //     const pdf = await getDocument(process.env.NEXT_PUBLIC_SITE_URL + url)
  //       .promise;

  //     const pages: string[] = [];

  //     for (let i = 1; i <= pdf.numPages; i++) {
  //       const page = await pdf.getPage(i);
  //       const viewport = page.getViewport({ scale: PDF_RENDER_SCALE });

  //       const canvas = document.createElement("canvas");
  //       const context = canvas.getContext("2d");
  //       if (!context) continue;

  //       canvas.width = viewport.width;
  //       canvas.height = viewport.height;

  //       await page.render({
  //         canvasContext: context,
  //         viewport,
  //       }).promise;

  //       // Only A3 landscape pages (ratio ≈ 1.413) are split.
  //       // A4 single pages (ratio ≈ 0.707) and any other size stay whole.
  //       const ratio = viewport.width / viewport.height;
  //       const isA3Spread = ratio > A3_RATIO_MIN && ratio < A3_RATIO_MAX;

  //       if (isA3Spread) {
  //         const half = canvas.width / 2;
  //         pages.push(cropCanvas(canvas, 0, half));
  //         pages.push(cropCanvas(canvas, half, half));
  //       } else {
  //         pages.push(canvas.toDataURL(PAGE_IMAGE_MIME));
  //       }
  //     }

  //     setImages(pages);
  //   } catch (error) {
  //     console.error("PDF render error:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    pdflink();
  }, [url]);

  const generatePDF = async () => {
    startDownload(() => {
      pdflink(true);
    })
  };

  if (loading || isLoadDownload) {
    return <div className={" h-screen bg-[#e2cf9e] flex items-center justify-center flex-col space-y-2"}>
      <div className="flex gap-2 items-center ">
        <ImageComponent
          src={"/assets/logo-lokalDark.png"}
          alt="short-logo"
          width={300}
          height={300}
          className="w-48"
        />
      </div>
      <span className=" inline-flex gap-1  items-center">
        <Loader className="mr-2 h-4 w-4 animate-spin" />
        Laster PDF...
      </span>
    </div>;
  }

  return (
    <div style={{ margin: "0 auto" }}>
      {images?.length > 0 ? (
        <Flipbook images={images} generatePDF={generatePDF} isMobile={isMobile} isLoadDownload={isLoadDownload} />
      ) : (
        <div>No Pages</div>
      )}
    </div>
  );
}
