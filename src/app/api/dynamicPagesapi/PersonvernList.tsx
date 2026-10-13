/* eslint-disable @typescript-eslint/no-explicit-any */

import { API } from "@/app/helper/apitools";
import { create } from "zustand";

type PersonvernListItem = {
  _id: string;
  order: number;
  title: string;
  p1: string;
  p2: string | null;
  li: {
    label: string;
    data: string;
  }[];
  address: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
};

interface PersonvernProperties {
  personvernList: PersonvernListItem[];
  FetchPersonvernList: (params?: any) => Promise<void>;
}

const GetPersonvernList = create<PersonvernProperties>((set) => ({
  personvernList: [],

  FetchPersonvernList: async (params?: any) => {
    try {
      const res = await API.GET("api/pages/personvern", params);
      const val = res?.data ?? [];

      set({ personvernList: val });
    } catch (error) {
      console.error("Failed to fetch personvern list", error);
    }
  },
}));

export default GetPersonvernList;
