/* eslint-disable @typescript-eslint/no-explicit-any */

import { API } from "@/app/helper/apitools";
import { create } from "zustand";

type BoligstoffListItem = {
  _id: string;
  order: number;
  images: string[];
  title: string;
  paragraph: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
};

interface BoligstoffProperties {
  boligstoffList: BoligstoffListItem[];
  FetchBoligstoffList: (params?: any) => Promise<void>;
}

const GetBoligstoffList = create<BoligstoffProperties>((set) => ({
  boligstoffList: [],

  FetchBoligstoffList: async (params?: any) => {
    try {
      const res = await API.GET("api/pages/boligstoff", params);

      const val = res?.data ?? [];
      set({ boligstoffList: val });
    } catch (error) {
      console.error("Failed to fetch boligstoff list", error);

      set({ boligstoffList: [] });
    }
  },
}));

export default GetBoligstoffList;
