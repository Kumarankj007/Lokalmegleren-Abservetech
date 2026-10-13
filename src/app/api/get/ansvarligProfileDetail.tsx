/* eslint-disable @typescript-eslint/no-explicit-any */

import { API } from '@/app/helper/apitools';
import { create } from 'zustand';

interface properties {
    ansvarligProfileDetail: [],
    loader: boolean,
    FetchansvarligProfileDetail: any
}

const GetansvarligansvarligProfileDetail = create<properties>((set) => ({

    ansvarligProfileDetail: [],
    loader: false,
    FetchansvarligProfileDetail: async (data:any) => {
        // debugger
        try {
            set({ loader: true })
            const res = await API.GET(`api/webmegler/employee/profile`,data);
            const val = await res?.data
            set({ ansvarligProfileDetail: val })
            set({ loader: false })
        }
        catch (error) {
            set({ loader: false })
            console.error('Failed to fetch', error);
        }
    }
}));

export default GetansvarligansvarligProfileDetail
