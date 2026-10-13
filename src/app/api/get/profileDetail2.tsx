/* eslint-disable @typescript-eslint/no-explicit-any */

import { API } from '@/app/helper/apitools';
import { create } from 'zustand';

interface properties {
    profileDetail2: [],
    load2: boolean,
    FetchProfileDetail2: any
}

const GetprofileDetail2 = create<properties>((set) => ({

    profileDetail2: [],
    load2: false,
    FetchProfileDetail2: async (data:any) => {
        // debugger
        try {
            set({ load2: true })
            const res = await API.GET(`api/webmegler/employee/profile`,data);
            const val = await res?.data
            set({ profileDetail2: val })
            set({ load2: false })
        }
        catch (error) {
            set({ load2: false })
            console.error('Failed to fetch', error);
        }
    }
}));

export default GetprofileDetail2
