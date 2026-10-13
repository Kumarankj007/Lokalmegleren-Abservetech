/* eslint-disable @typescript-eslint/no-explicit-any */

import { API } from '@/app/helper/apitools';
import { create } from 'zustand';

interface properties {
    companyDetail: [],
    FetchCompanyDetail: any
}

const GetCompanyDetail = create<properties>((set) => ({
    companyDetail: [],
    FetchCompanyDetail: async (id: any,data:any) => {
        try {
            const res = await API.GET(`api/webmegler/departments/${id}`,data);
            const val = await res?.data
            set({ companyDetail: val })
        }
        catch (error) {
            console.error('Failed to fetch', error);
        }
    }
}));

export default GetCompanyDetail
