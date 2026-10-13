/* eslint-disable @typescript-eslint/no-explicit-any */

import { API } from '@/app/helper/apitools';
import { create } from 'zustand';

interface properties {
    brokersList: [],
    FetchBrokersList: any
}

const GetBrokersList = create<properties>((set) => ({

    brokersList: [],
    FetchBrokersList: async (params:any) => {
        try {
            const res = await API.GET(`api/webmegler/employees`,params);
            const val = await res?.data
            set({ brokersList: val })
        }
        catch (error) {
            console.error('Failed to fetch', error);
        }
    }
}));

export default GetBrokersList
