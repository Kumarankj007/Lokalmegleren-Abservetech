/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import useLoaderStore from "../store/loader";
import fetchAPI from "./fetchapi";
// import { getCookie } from "./utils";

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const token =
  "eyJhbGciOiJSUzI1NiIsImtpZCI6IjBDMUNFNDNDMEQ3OTFFOTVBMUQ2NEVEOTRBQkEyOTRDOTE1NkRENEUiLCJ0eXAiOiJKV1QiLCJ4NXQiOiJEQnprUEExNUhwV2gxazdaU3JvcFRKRlczVTQifQ.eyJuYmYiOjE3NDI5Njc5MjcsImV4cCI6MTc0Mjk3MTUyNywiaXNzIjoiaHR0cHM6Ly9hcGkud2VibWVnbGVyLm5vL29hdXRoIiwiYXVkIjpbImh0dHBzOi8vYXBpLndlYm1lZ2xlci5uby9vYXV0aC9yZXNvdXJjZXMiLCJhcGkud2VibWVnbGVyLm5vIiwiYXBwLndlYm1lZ2xlci5ubyJdLCJjbGllbnRfaWQiOiJsb2thbG1lZ2xlcmVuLjM4MS5vYXV0aDIiLCJzY29wZSI6WyJodHRwczovL2FwaS53ZWJtZWdsZXIubm8vYXV0aC9jb25zZW50LmNvbmZpZyIsImh0dHBzOi8vYXBpLndlYm1lZ2xlci5uby9hdXRoL3RlbmFudHMvMzgxIiwiaHR0cHM6Ly9hcGkud2VibWVnbGVyLm5vL2F1dGgveG1sc29rZW1vdG9yLmRlcGFydG1lbnQiLCJodHRwczovL2FwaS53ZWJtZWdsZXIubm8vYXV0aC94bWxzb2tlbW90b3IuZGVwYXJ0bWVudC5lbXBsb3llZSIsImh0dHBzOi8vYXBpLndlYm1lZ2xlci5uby9hdXRoL3htbHNva2Vtb3Rvci5saXN0aW5nIiwiaHR0cHM6Ly9hcGkud2VibWVnbGVyLm5vL2F1dGgveG1sc29rZW1vdG9yLmxpc3RpbmcucHJvamVjdCIsImh0dHBzOi8vYXBpLndlYm1lZ2xlci5uby9hdXRoL3htbHNva2Vtb3Rvci5saXN0aW5nLnNlbGxlciIsImh0dHBzOi8vYXBwLndlYm1lZ2xlci5uby9hdXRoL2Fuc2F0dGUucmVhZCIsImh0dHBzOi8vYXBwLndlYm1lZ2xlci5uby9hdXRoL2F2ZGVsaW5nZXIucmVhZCIsImh0dHBzOi8vYXBwLndlYm1lZ2xlci5uby9hdXRoL2RhZ2Jvay5yZWFkd3JpdGUiLCJodHRwczovL2FwcC53ZWJtZWdsZXIubm8vYXV0aC9maXJtYS5yZWFkIiwiaHR0cHM6Ly9hcHAud2VibWVnbGVyLm5vL2F1dGgvb3BwZHJhZy5yZWFkIl19.YNTzqOFk3eOg0CU1EINCqs6fdtGV8Qsx9ZvGghn2noTfu0KRbSGpji3WssY3FI9WaGIrDiYOvIv9QcRXX35q2WklrYpF1_VMrdeu-t9iwlT07FJOybQyUlTLoUTThYRIVTA0M1OVYz3MgsrqhQPQkIiv6e0b1rHP8JH5h9J4d99wBERSCyY951AUiROQJaFOYzbwu0tXlc0GXuoc7lPvaDbcZzPJivGZPVegXIZkInendNQjS6UoyAqvgZ9SvSkCrldvpCwjHpere43l7-_j16jDxB0dm-5-pFbDaaWHKONbBd65tdW68zbsbvvlEyVRCYR2TrDVkDnp77p0hkHaw9w3h15MIYTpcc-idBJaRGY94UJSnEiuff3wH4LMGfHTkjjv8Wol8-6ZSJDZRHVjZ7rBKKDeRdnfmENbQBmylXSUvGxkF9q_CJXwO-etMuME_l1z-GijD-BZbduxj6hRsGyv8ruoOAPSD1Ud7B-MWY96DzngKd8VviZZdXlDWdZph8fnDKxq4vAx0muix7J5h0FYAIfWVB_oI-xHWGoA149qS-zVM3ChKC636f_Ltfz3anSwav4iH_rTgTKYkCCr9IGH3urxjwQdi93awha1jS35iebweaVqUUA991y1XuOlbJUxnAuoSSyFTe0mQNTYxAR8BAFik_1EpBM7-yVdRms";
export const API = {
  baseurl: BASE_URL,
  token, // Automatically included

  GET: async function (endpoint: string, params: Record<string, any> = {}) {
    // debugger;
    const { setLoading } = useLoaderStore.getState();
    // console.log("baseurl", this.baseurl);
    try {
      setLoading(true);

      // Convert params object to query string
      const queryString = new URLSearchParams({
        // token: this.token,
        ...params,
      }).toString();
      let url;
      if (queryString) {
        url = `${this.baseurl}${endpoint}?${queryString}`;
      } else {
        url = `${this.baseurl}${endpoint}`;
      }

      const headers = {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        Accept: "application/json",
      };

      const response = await fetchAPI(url, { method: "GET", headers });

      return response.data;
    } catch (error: any) {
      console.error("API GET Error:", error);
      throw new Error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  },

  POST: async function (endpoint: any, data?: any) {
    const { setLoading } = useLoaderStore.getState();
    try {
      setLoading(true);
      const headers = {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        Accept: "application/json",
      };
      let payload: any = {};
      payload.method = "POST";

      payload.headers = headers;
      if (data instanceof FormData) {
        payload.body = data;
      } else {
        payload.body = JSON.stringify(data);
      }
      // console.log(data, 'payload')
      const resource: any = await fetchAPI(
        `${this.baseurl}${endpoint}`,
        payload,
      );
      if (resource.response.status !== 200) {
        setLoading(true);
        throw resource.data || { message: "failed" };
      }
      setLoading(false);
      return resource.data;
    } catch (err: any) {
      setLoading(false);
      if (err) {
        throw err;
      }
    } finally {
      setLoading(false);
    }
  },
};
