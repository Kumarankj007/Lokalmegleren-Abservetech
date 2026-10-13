/* eslint-disable @typescript-eslint/no-explicit-any */

import { API } from '@/app/helper/apitools';
import { create } from 'zustand';

interface properties {
    reviews: [],
    FetchReviews: any
}

const GetReviews = create<properties>((set) => ({

    reviews: [],
    FetchReviews: async () => {
        try {
            const res = await API.GET(`api/webmegler/reviews`);
            const val = await res?.data?.reviews
            set({ reviews: val })
        }
        catch (error) {
            console.error('Failed to fetch', error);
        }
    }
}));

export default GetReviews

