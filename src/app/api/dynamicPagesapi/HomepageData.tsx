/* eslint-disable @typescript-eslint/no-explicit-any */

import { API } from "@/app/helper/apitools";
import { create } from "zustand";

type ContactUsItem = {
  _id: string;
  head: string;
  desc: string;
};

type BannerType = {
  title: string;
  image: string;
  disc: string[];
};

type ContactUsType = {
  title: string;
  data: ContactUsItem[];
};

type HomepageData = {
  _id: string;
  banner: BannerType;
  contactUs: ContactUsType;
  aboutUs: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
};

interface HomepageStoreProperties {
  homepageData: HomepageData | null;
  FetchHomepageData: (params?: any) => Promise<void>;
}

const GetHomepageData = create<HomepageStoreProperties>((set) => ({
  homepageData: null,

  FetchHomepageData: async (params?: any) => {
    try {
      const res = await API.GET("api/pages/hjem", params);

      const val = res?.data ?? null;

      set({ homepageData: val });
    } catch (error) {
      console.error("Failed to fetch homepage data", error);

      set({ homepageData: null });
    }
  },
}));

export default GetHomepageData;
