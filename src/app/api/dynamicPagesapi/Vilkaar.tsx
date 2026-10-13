/* eslint-disable @typescript-eslint/no-explicit-any */

import { API } from "@/app/helper/apitools";
import { create } from "zustand";

type VilkaarListItem = {
  _id: string;
  order: number;
  title: string;
  p1: string | null;
  p2: string | null;
  li: {
    label: string;
    data: string;
  }[];
  createdAt: string;
  updatedAt: string;
  __v: number;
};

interface VilkaarProperties {
  vilkaarList: VilkaarListItem[];
  FetchVilkaarList: (params?: any) => Promise<void>;
}

const GetVilkaarList = create<VilkaarProperties>((set) => ({
  vilkaarList: [],

  FetchVilkaarList: async (params?: any) => {
    try {
      const res = await API.GET("api/pages/vilkaar", params);
      const val = res?.data ?? [];

      set({ vilkaarList: val });
    } catch (error) {
      console.error("Failed to fetch vilkaar list", error);
    }
  },
}));

export default GetVilkaarList;
