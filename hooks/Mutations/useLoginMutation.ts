import { useMutation, UseMutationResult } from "@tanstack/react-query";
// import { useNavigate } from "react-router";
import { useRouter } from '@/components/navigation';
import { loginApiMethod, setToken } from "../../services/authService";
import { showToast } from "@/lib/toastSonner";

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginApiProps {
  url: { apiUrl: string };
  body: LoginPayload;
}

interface User {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LoginResponse {
  message: string;
  data: User;
  token: string;
  status: boolean;
  statusCode: number;
}

interface ErrorResponse {
  message?: string;
}

export const useLoginMutation = (): UseMutationResult<
  LoginResponse,
  unknown,
  LoginApiProps
> => {
  // const navigate = useNavigate();
  const router = useRouter();

  return useMutation<LoginResponse, unknown, LoginApiProps>({
    mutationFn: loginApiMethod,

    onSuccess: (data:LoginResponse) => {
      if (data?.status) {
        const user = data.data;
        const token = data?.token;
        if (token && user?._id) {
          setToken(token, user._id, user);
        }

        showToast.success(data.message || "Login successful");
        router.push('/dashboard/analytics');
        // router.push('/admin');
      } else {
        console.error("Login failed: Invalid response format", data);
        showToast.error(data.message || "Login failed");
      }
    },

    onError: (error) => {
      const err = error as { response?: { data?: ErrorResponse } };
      const errorMessage = err.response?.data?.message || "Login error";
      showToast.error(errorMessage);
      console.error("Login error:", errorMessage);
    },
  });
}

export const useRegisterMutation = (): UseMutationResult<
  LoginResponse,
  unknown,
  LoginApiProps
> => {
  // const navigate = useNavigate();
  const router = useRouter();

  return useMutation<LoginResponse, unknown, LoginApiProps>({
    mutationFn: loginApiMethod,

    onSuccess: (data:LoginResponse) => {
      if (data?.status) {

        showToast.success(data.message || "Register successful");
        router.push('/');
        // router.push('/admin');
      } else {
        console.error("Register failed: Invalid response format", data);
        showToast.error(data.message || "Register failed");
      }
    },

    onError: (error) => {
      const err = error as { response?: { data?: ErrorResponse } };
      const errorMessage = err.response?.data?.message || "Register error";
      showToast.error(errorMessage);
      console.error("Register error:", errorMessage);
    },
  });
}