import { API } from "@/app/helper/apitools";
import { create } from "zustand";

interface properties {
  describitonList: [];
  describitonListLoad: boolean;
  // See propertyDetail store: distinguishes "not fetched yet" from "empty".
  describitonListReady: boolean;
  FetchDescribitonList: any;
}

const GetBriefDetail = create<properties>((set) => ({
  describitonList: [],
  describitonListLoad: false,
  describitonListReady: false,
  FetchDescribitonList: async (params: any) => {
    try {
      set({ describitonListLoad: true });
      const res = await API.GET(`api/webmegler/brief/property`, params);
      if (res?.data) {
        const val = await res?.data;
        set({ describitonList: val, describitonListLoad: false, describitonListReady: true });
      }else{
        set({ describitonListLoad: false, describitonListReady: true });
      }
    } catch (error) {
      console.error("Failed to fetch", error);
      set({ describitonListLoad: false, describitonListReady: true });
    }
  },
}));

export default GetBriefDetail;
