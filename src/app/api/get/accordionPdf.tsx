import { API } from '@/app/helper/apitools';
import { create } from 'zustand';

interface properties {
    titleList: [],
    titleListLoad: boolean;
    // See propertyDetail store: distinguishes "not fetched yet" from "empty".
    titleListReady: boolean;
    FetchtitleList: any
}

const GetProductDetail = create<properties>((set) => ({

    titleList: [],
    titleListLoad: false,
    titleListReady: false,
    FetchtitleList: async (params:any) => {
        try {
            set({ titleListLoad: true })
            const res = await API.GET(`api/webmegler/properties/documents`,params);
            const val = await res?.data
            set({ titleList: val, titleListLoad: false, titleListReady: true })
        }
        catch (error) {
            set({ titleListLoad: false, titleListReady: true })
            console.error('Failed to fetch', error);
        }
    }
}));

export default GetProductDetail

