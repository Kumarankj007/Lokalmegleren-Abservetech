/* eslint-disable @typescript-eslint/no-explicit-any */

import { API } from "@/app/helper/apitools";
import { create } from "zustand";

interface properties {
  contactUs: [];
  FetchContactUs: any;
}

const GetContact = create<properties>((set) => ({
  contactUs: [],
  FetchContactUs: async (params:any) => {
    try {
      const res = await API.POST(`api/webmegler/contactUs`, params);
      const val = await res;
      // console.log(val, 'contactUs')
      set({ contactUs: val });
      return val
    } catch (error) {
      console.error("Failed to fetch", error);
    }
  },
}));

export default GetContact;
