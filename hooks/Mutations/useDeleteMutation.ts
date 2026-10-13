import { useMutation, UseMutationResult } from "@tanstack/react-query";
// import { useNavigate } from "react-router";
import { apiMethod } from "../../services/global";
import { showToast } from "@/lib/toastSonner";

export interface MutationParams {
  url: { apiUrl: string };
  body?: Record<string, unknown> | FormData;
}

export interface ApiResponse {
  status: boolean | number | string;
  success: boolean | number | string;
  message: string;
  data?: {
    message?: string;
    [key: string]: unknown;
  };
}

export default function useDeleteMutation(
  onSuccessRedirect?: string
): UseMutationResult<ApiResponse | FormData, unknown, MutationParams> {
  // const navigate = useNavigate();

  return useMutation<ApiResponse | FormData, unknown, MutationParams>({
    mutationFn: async ({ url, body }) => {
      return await apiMethod("delete", url.apiUrl, body) as ApiResponse | FormData;
    },
    onSuccess: (data) => {
      if (data instanceof FormData) {
        console.log("Got FormData back");
        return;
      }
      showToast.success(data.message || "Submitted successfully");
      // if (onSuccessRedirect) navigate(onSuccessRedirect);
    },
  });
}