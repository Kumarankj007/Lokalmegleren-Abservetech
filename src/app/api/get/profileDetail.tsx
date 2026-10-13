/* eslint-disable @typescript-eslint/no-explicit-any */

import { API } from '@/app/helper/apitools';
import { create } from 'zustand';

interface properties {
    profileDetail: [],
    load: boolean,
    FetchProfileDetail: any
}

const GetprofileDetail = create<properties>((set) => ({

    profileDetail: [],
    load: false,
    FetchProfileDetail: async (data:any) => {
        // debugger
        try {
            set({ load: true })
            const res = await API.GET(`api/webmegler/employee/profile`,data);
            const val = await res?.data
            set({ load: false, profileDetail: val })
        }
        catch (error) {
            set({ load: false })
            console.error('Failed to fetch', error);
        }
    }
}));

export default GetprofileDetail
