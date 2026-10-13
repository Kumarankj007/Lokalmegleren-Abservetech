/* eslint-disable @typescript-eslint/no-explicit-any */

import { API } from '@/app/helper/apitoolspdf';
import { create } from 'zustand';

interface properties {
    pdfList: any[];
    FetchpdfList: (params: { tenantId: string; propertyId: string; id?: string }) => Promise<void>;
}

const GetPDFDownload = create<properties>((set) => ({
    pdfList: [],
FetchpdfList: async (params) => {
  try {
    const result = await API.GETPDF(`api/webmegler/file/document/${params.id}`, {
      tenantId: params.tenantId,
      propertyId: params.propertyId,
    });

    if (result instanceof Blob) {
      // It's a PDF, trigger download or open in new tab
      const blobUrl = URL.createObjectURL(result);
      window.open(blobUrl, "_blank");
    } else {
      // It's a JSON list of PDFs
      set({ pdfList: result });
    }
  } catch (error) {
    console.error("Failed to fetch PDF:", error);
  }
}


}));

export default GetPDFDownload

