/* eslint-disable @typescript-eslint/no-explicit-any */

import { API } from '@/app/helper/apitools';
import { create } from 'zustand';

interface desc {
    brokerDesc: [],
    load: boolean,
    FetchBrokerDesc: any
}

const GetBrokerDesc = create<desc>((set) => ({

    brokerDesc: [],
    load: false,
    FetchBrokerDesc: async () => {
        try {
            set({load: true})
            const res = await API.GET(`api/webmegler/description`);
            const val = await res?.data;
            set({ brokerDesc: val })
            set({load: false})
        }
        catch (error) {
            set({load: false});
            console.error('Failed to fetch', error);
        }
    }
}));

export default GetBrokerDesc

