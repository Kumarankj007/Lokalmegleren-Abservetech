/* eslint-disable @typescript-eslint/no-explicit-any */

import { API } from '@/app/helper/apitools';
import { create } from 'zustand';

interface properties {
    employeeProfile: [],
    FetchEmployeeProfile: any
}

const GetEmployeeProfile = create<properties>((set) => ({

    employeeProfile: [],
    FetchEmployeeProfile: async (params:any) => {
        try {
            const res = await API.GET(`api/webmegler/employee/profile`,params);
            const val = await res?.data
            set({ employeeProfile: val })
            return val;
        }
        catch (error) {
            console.error('Failed to fetch', error);
        }
    }
}));

export default GetEmployeeProfile
