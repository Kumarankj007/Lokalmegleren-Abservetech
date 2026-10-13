/* eslint-disable @typescript-eslint/no-explicit-any */

import { API } from '@/app/helper/apitools';
import { create } from 'zustand';

interface properties {
    CompaniesList: [],
    FetchCompaniesList: any
}

const GetCompaniesList = create<properties>((set) => ({

    CompaniesList: [],
    FetchCompaniesList: async (params:any) => {
        try {
            const res = await API.GET(`api/webmegler/companies`,params);
            const val = await res?.data
            set({ CompaniesList: val })
        }
        catch (error) {
            console.error('Failed to fetch', error);
        }
    }
}));

export default GetCompaniesList
