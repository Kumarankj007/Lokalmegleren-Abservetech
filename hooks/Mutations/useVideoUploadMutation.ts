import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { postVideoMethod } from "@/services/global";
import { showToast } from "@/lib/toastSonner";
import { APICONSTANT } from "@/services/config";

interface UploadParams {
  file: File;
  apiUrl?: string;
  onUploadProgress?: (progress: number) => void;
  controller?: AbortController;
}

interface UploadResponse {
  data?: string;
  message?: string;
  success?: boolean;
}

interface UploadError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useVideoUploadMutation = (): UseMutationResult<
  UploadResponse,
  UploadError,
  UploadParams
> => {
  return useMutation<UploadResponse, UploadError, UploadParams>({
    mutationFn: async ({
      file,
      apiUrl = APICONSTANT.UPLOAD_INTRO_VIDEO,
      onUploadProgress,
      controller,
    }) => {
      return (await postVideoMethod(apiUrl, file, onUploadProgress, controller)) as UploadResponse;
    },

    onSuccess: (response) => {
      const msg = response.message || "Video uploaded successfully!";
      showToast.success(msg);
      // console.log("Upload success:", response);
    },

    onError: (error) => {
      const msg = error.response?.data?.message || "Video upload failed!";
      showToast.error(msg);
      console.error("Upload error:", error);
    },
  });
};