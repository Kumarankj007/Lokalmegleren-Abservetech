// src/services/global.ts
import axios from "./axiosInstance";
import axiosLib from "axios";
import { APICONSTANT, APIURLS } from "./config";
import { QueryFunctionContext } from "@tanstack/react-query";

export const getApiMethos = async <T>({
  queryKey,
  signal,
}: QueryFunctionContext<readonly unknown[]>): Promise<T> => {
  const [, apiConstant, query_string] = queryKey as [string, string, string];

  const api = `${APIURLS.baseUrl}${apiConstant}${query_string || ""}`;
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No auth token found");

  const config = {
    signal,
    headers: { Authorization: token },
  };

  const response = await axios.get(api, config);
  return response.data as T;
};

export const fetchApi = async <T>(
  apiConstant: string,
  query_string = "",
): Promise<T> => {
  const api = `${APIURLS.baseUrl}${apiConstant}${query_string}`;
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No auth token found");

  const config = {
    headers: { Authorization: token },
  };

  const response = await axios.get(api, config);
  return response.data as T;
};

// POST API Method (non-generic)
export const postApiMethod = async (
  apiUrl: string,
  body: Record<string, unknown> | FormData | URLSearchParams,
) => {
  try {
    const url = `${APIURLS.baseUrl}${apiUrl}`;
    const response = await axios.post(url, body);
    return response.data;
  } catch (error) {
    console.error("POST error:", error);
    throw error;
  }
};

// PUT API Method (non-generic)
export const putApiMethod = async (
  apiUrl: string,
  body: Record<string, unknown> | FormData,
) => {
  try {
    const url = `${APIURLS.baseUrl}${apiUrl}`;
    const response = await axios.put(url, body);
    return response.data;
  } catch (error) {
    console.error("PUT error:", error);
    throw error;
  }
};

// PATCH API Method (non-generic)
export const patchApiMethod = async (
  apiUrl: string,
  body: Record<string, unknown> | FormData,
) => {
  try {
    const url = `${APIURLS.baseUrl}${apiUrl}`;
    const response = await axios.patch(url, body);
    return response.data;
  } catch (error) {
    console.error("PATCH error:", error);
    throw error;
  }
};

// DELETE API Method (non-generic)
// export const deleteApiMethod = async (
//   apiUrl: string,
//   body?: Record<string, unknown>
// ) => {
//   try {
//     const url = `${APIURLS.baseUrl}${apiUrl}`;
//     const config = body ? { data: body } : undefined;
//     const response = await axios.delete(url, config);
//     return response.data;
//   } catch (error) {
//     console.error("DELETE error:", error);
//     throw error;
//   }
// };

// Generic Method for POST, PUT, PATCH, DELETE
export const apiMethod = async (
  method: "post" | "put" | "patch" | "delete" | "get",
  apiUrl: string,
  body?: Record<string, unknown> | FormData,
) => {
  try {
    const response = await axios({
      method,
      url: `${APIURLS.baseUrl}${apiUrl}`,
      data: body,
    });

    return response.data;
  } catch (error) {
    console.error(`${method.toUpperCase()} error at ${apiUrl}:`, error);
    throw error;
  }
};

export const postVideoMethod = async (
  apiUrl: string,
  file: File,
  onUploadProgress?: (progress: number) => void,
  controller?: AbortController,
) => {
  const url = `${APIURLS.baseUrl}${apiUrl}`;
  const formData = new FormData();
  formData.append("lectureFiles", file);

  try {
    const config = {
      signal: controller?.signal, // supports cancel
      onUploadProgress: (event: ProgressEvent) => {
        if (event.total) {
          const progress = Math.round((event.loaded * 100) / event.total);
          onUploadProgress?.(progress);
        }
      },
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    const response = await axios.post(url, formData, config);
    return response.data;
  } catch (error: any) {
    if ((axiosLib as any).isCancel && (axiosLib as any).isCancel(error)) {
      console.warn("Upload canceled by user");
    } else {
      console.error("Video upload failed:", error);
    }
    throw error;
  }
};

// ─── Types ────────────────────────────────────────────────────
export interface DocumentImage {
  id: string | number;
  navn: string;
  kategori: string;
  totalPages: number;
  images: string[];
  progress: string;
}

export interface FetchDocumentImagesOptions {
  tenantId: string | number;
  propertyId: string | number;
  onDocument: (doc: DocumentImage) => void;
  onProgress?: (done: number, total: number) => void;
  onError?: (error: string) => void;
  signal?: AbortSignal;
}

// ─── Function ─────────────────────────────────────────────────
export const fetchDocumentImages = async ({
  tenantId,
  propertyId,
  onDocument,
  onProgress,
  onError,
  signal,
}: FetchDocumentImagesOptions): Promise<void> => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${APIURLS?.baseUrl + APICONSTANT.DOCUMENTIMG}?tenantId=${tenantId}&propertyId=${propertyId}`,
      {
        signal,
        headers: {
          Authorization: `${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error("Response body is empty");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const data = JSON.parse(line);

          if (data.error) {
            onError?.(data.error);
            continue;
          }

          const doc = data as DocumentImage;
          onDocument(doc);

          if (doc.progress && onProgress) {
            const [doneStr, totalStr] = doc.progress.split("/");
            onProgress(parseInt(doneStr, 10), parseInt(totalStr, 10));
          }
        } catch (err) {
          console.error("Failed to parse line:", line, err);
        }
      }
    }

    // Flush remainder
    if (buffer.trim()) {
      try {
        const data = JSON.parse(buffer);
        if (data.error) {
          onError?.(data.error);
        } else {
          onDocument(data as DocumentImage);
        }
      } catch (err) {
        console.error("Failed to parse final chunk:", buffer, err);
      }
    }
  } catch (err) {
    if ((err as Error).name === "AbortError") return;
    const message = err instanceof Error ? err.message : "Unknown error";
    onError?.(message);
    throw err;
  }
};