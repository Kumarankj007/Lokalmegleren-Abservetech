/* eslint-disable @typescript-eslint/no-explicit-any */

import { API } from "@/app/helper/apitools";
import { create } from "zustand";

type LedigeItem = {
  _id: string;
  order: number;
  image: string;
  head: string;
  p: string;
  detailImage: string | null;
  detailTitle: string | null;
  sections: any[];
  contact: any | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

interface LedigeProperties {
  ledigeList: LedigeItem[];
  FetchLedigeList: (params?: any) => Promise<void>;
}

const GetLedigeList = create<LedigeProperties>((set) => ({
  ledigeList: [],

  FetchLedigeList: async (params?: any) => {
    try {
      const res = await API.GET("api/pages/ledige", params);

      const val = res?.data ?? [];

      set({ ledigeList: val });
    } catch (error) {
      console.error("Failed to fetch ledige list", error);

      set({ ledigeList: [] });
    }
  },
}));

export default GetLedigeList;
