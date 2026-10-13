// import { useMutation, UseMutationResult } from "@tanstack/react-query";
// import { useNavigate } from "react-router";
// import { apiMethod } from "../../services/global";

// export interface MutationParams {
//   url: { apiUrl: string };
//   body?: Record<string, unknown> | FormData;
// }

// export interface ApiResponse {
//   status: boolean | number;
//   message: string;
//   data?: {
//     message?: string;
//     [key: string]: unknown;
//   };
// }

// export default function usePutMutation(
//   onSuccessRedirect?: string
// ): UseMutationResult<ApiResponse, unknown, MutationParams> {
//   const navigate = useNavigate();

//   return useMutation({
//     mutationFn: async ({ url, body }) => {
//       return await apiMethod("put", url.apiUrl, body);
//     },
//     onSuccess: (data) => {
//       console.log("PUT success:", data);
//       if (onSuccessRedirect) navigate(onSuccessRedirect);
//     },
//     onError: (error) => {
//       console.error("PUT error:", error);
//     },
//   });
// }