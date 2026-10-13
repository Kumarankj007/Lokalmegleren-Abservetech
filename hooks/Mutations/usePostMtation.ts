// import { useMutation, UseMutationResult } from "@tanstack/react-query";
// import { useNavigate } from "react-router";
// import { postApiMethod } from "../../services/global";

// // Type for API input
// interface PostMutationParams {
//   url: { apiUrl: string };
//   body: Record<string, unknown> | FormData | URLSearchParams;
// }

// // Type for API response (adjust if your backend uses a different shape)
// interface ApiResponse {
//   status: boolean | number;
//   message: string;
//   success?: boolean;
//   data?: {
//     message?: string;
//     [key: string]: unknown;
//   };
// }

// export default function usePostMutation(
//   onSuccessRedirect?: string
// ): UseMutationResult<ApiResponse, unknown, PostMutationParams> {
//   const navigate = useNavigate();

//   return useMutation<ApiResponse, unknown, PostMutationParams>({
//     mutationFn: async ({ url, body }) => {
//       return await postApiMethod(url.apiUrl, body);
//     },
//     onSuccess: (data) => {
//       // console.log("POST success:", data);
//       // showToast(data.message || "Submitted successfully", "success");

//       if (onSuccessRedirect) {
//         navigate(onSuccessRedirect);
//       }
//     },
//     onError: (error) => {
//       console.error("POST error:", error);
//       // showToast("Something went wrong", "error");
//     },
//   });
// }