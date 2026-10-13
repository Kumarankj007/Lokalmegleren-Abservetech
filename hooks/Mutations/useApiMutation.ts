import { useMutation, UseMutationResult } from "@tanstack/react-query";
// import { useNavigate } from "react-router";
import { apiMethod } from "../../services/global";
import { showToast } from "@/lib/toastSonner";

type HttpMethod = "post" | "put" | "patch" | "delete" | "get";

interface ApiMutationParams {
  url: { apiUrl: string };
  body?: Record<string, unknown> | FormData;
}

interface ApiResponse {
  status?: boolean;
  error?: boolean,
  success?: boolean;
  message?: string;
  // data?: unknown;
  data: {
    [x: string]: any;
    id: string;
  };
}

// define a lightweight custom error type for your use case
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function useApiMutation(
  method: HttpMethod,
  onSuccessRedirect?: string,
  customSuccessMessage?: string
): UseMutationResult<ApiResponse, ApiError, ApiMutationParams> {
  // const navigate = useNavigate();

  return useMutation<ApiResponse, ApiError, ApiMutationParams>({
    mutationFn: async ({ url, body }) => {
      return (await apiMethod(method, url.apiUrl, body)) as unknown as ApiResponse;
    },
    onSuccess: (response) => {
      const message = customSuccessMessage || response.message || "Vellykket!";
      showToast.success(message);

      // console.log(`${method.toUpperCase()} success:`, response);

      if (onSuccessRedirect) {
        // navigate(onSuccessRedirect);
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Something went wrong!";
      showToast.error(errorMessage);
      console.error(`${method.toUpperCase()} error:`, error);
    },
  });
}