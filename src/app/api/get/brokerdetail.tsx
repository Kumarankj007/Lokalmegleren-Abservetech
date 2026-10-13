/* eslint-disable @typescript-eslint/no-explicit-any */

import { API } from '@/app/helper/apitools';
import { create } from 'zustand';

interface properties {
    brokerDetail: [],
    FetchBrokerDetail: any
}

const GetBrokerDetail = create<properties>((set) => ({
    brokerDetail: [],
    FetchBrokerDetail: async (id: any,data:any) => {
        try {
            const res = await API.GET(`api/webmegler/employees/${id}`,data);
            const val = await res?.data
            set({ brokerDetail: val })
        }
        catch (error) {
            console.error('Failed to fetch', error);
        }
    }
}));

export default GetBrokerDetail
