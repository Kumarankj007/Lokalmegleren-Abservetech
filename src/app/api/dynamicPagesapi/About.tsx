/* eslint-disable @typescript-eslint/no-explicit-any */

import { API } from "@/app/helper/apitools";
import { create } from "zustand";

type OmOssListItem = {
  _id: string;
  order: number;
  title: string;
  li: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
};

interface OmOssProperties {
  omOssList: OmOssListItem[];
  FetchOmOssList: (params?: any) => Promise<void>;
}

const GetOmOssList = create<OmOssProperties>((set) => ({
  omOssList: [],

  FetchOmOssList: async (params?: any) => {
    try {
      const res = await API.GET("api/pages/omoss", params);
      const val = res?.data ?? [];

      set({ omOssList: val });
    } catch (error) {
      console.error("Failed to fetch om oss list", error);
    }
  },
}));

export default GetOmOssList;
