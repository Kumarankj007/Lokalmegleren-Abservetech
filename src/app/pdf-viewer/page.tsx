"use client";

import React from "react";
import dynamic from "next/dynamic";

// pdfjs-dist v5 is browser-only: its module top-level code crashes when
// evaluated during SSR ("Object.defineProperty called on non-object").
// Load the viewer client-side only so pdfjs never runs on the server.
const PdfToImages = dynamic(() => import("./pdfhtml"), { ssr: false });

function Page() {
  return (
    <section className="">
      <PdfToImages />
    </section>
  );
}

export default Page;
