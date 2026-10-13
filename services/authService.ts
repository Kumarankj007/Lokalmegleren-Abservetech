import axios from "./axiosInstance";
import { APIURLS } from "./config";

// interface LoginPayload {
//   email: string;
//   password: string;
//   role: string;
//   rememberMe: boolean;
// }

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  fistname: string;
  lastname: string;
  email: string;
  password: string;
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


export const setToken = (token: string, userId?: string, user?: User) => {
  localStorage.setItem("token", token);
  if (userId) {
    localStorage.setItem("user_id", userId);
    localStorage.setItem("user", JSON.stringify(user));
  }
};

export const getToken = () => localStorage.getItem("token") || null;

export const getUserId = () => localStorage.getItem("user_id") || null;

export const getUser = () => localStorage.getItem("user") || null;

export const clearToken = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user_id");
};

export const loginApiMethod = async (payload: {
  url: { apiUrl: string };
  body: LoginPayload;
}): Promise<LoginResponse> => {
  const api = APIURLS.baseUrl + payload.url.apiUrl;

  const response = await axios.post<LoginResponse>(api, payload.body);

  return response.data;
};

export const registerApiMethod = async (payload: {
  url: { apiUrl: string };
  body: RegisterPayload;
}): Promise<LoginResponse> => {
  const api = APIURLS.baseUrl + payload.url.apiUrl;

  const response = await axios.post<LoginResponse>(api, payload.body);

  return response.data;
};