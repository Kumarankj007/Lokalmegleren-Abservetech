/* eslint-disable @typescript-eslint/no-explicit-any */

import { API } from "@/app/helper/apitools";
import { create } from "zustand";

interface properties {
  propertyDetail: [];
  propertyDetailLoad: boolean;
  // `*Ready` = a fetch (or server hydration) has settled, successfully or not.
  // Without it "never fetched" looks identical to "loaded and empty", and the
  // UI renders a blank gap instead of a skeleton.
  propertyDetailReady: boolean;
  FetchPropertyDetail: any;
  propertyVisiting: [];
  propertyVisitingLoad: boolean;
  propertyVisitingReady: boolean;
  FetchPropertyVisiting: any;
}

const GetPropertyDetail = create<properties>((set) => ({
  propertyDetail: [],
  propertyDetailLoad: false,
  propertyDetailReady: false,
  FetchPropertyDetail: async (id: any, data: any) => {
    try {
      set({ propertyDetailLoad: true });
      const res = await API.GET(`api/webmegler/properties/${id}`, data);
      const val = await res?.data;
      if (val) {
        set({ propertyDetailLoad: false, propertyDetailReady: true, propertyDetail: val });
      } else {
        set({ propertyDetailLoad: false, propertyDetailReady: true });
      }
    } catch (error) {
        set({ propertyDetailLoad: false, propertyDetailReady: true });
      console.error("Failed to fetch", error);
    }
  },
  propertyVisiting: [],
  propertyVisitingLoad: false,
  propertyVisitingReady: false,
  FetchPropertyVisiting: async (id: any, data: any) => {
    try {
      set({ propertyVisitingLoad: true });
      const res = await API.GET(
        `api/webmegler/properties/visiting/${id}`,
        data
      );
      const val = await res?.data;
      if (val) {
        set({ propertyVisitingLoad: false, propertyVisitingReady: true, propertyVisiting: val });
      } else {
        set({ propertyVisitingLoad: false, propertyVisitingReady: true });
      }
    } catch (error) {
        set({ propertyVisitingLoad: false, propertyVisitingReady: true });
      console.error("Failed to fetch", error);
    }
  },
}));

export default GetPropertyDetail;
