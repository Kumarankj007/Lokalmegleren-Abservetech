/* eslint-disable @typescript-eslint/no-explicit-any */

import { API } from '@/app/helper/apitools';
import { create } from 'zustand';

interface properties {
    DocumentLink: [],
    DocumentLinkLoad: boolean;
    FetchDocumentLink: any
}

const GetDocumentLink = create<properties>((set) => ({

    DocumentLink: [],
    DocumentLinkLoad: false,
    FetchDocumentLink: async (data:any) => {
        
        try {
            set({ DocumentLinkLoad: true })
            const res = await API.GET(`api/webmegler/properties/linker`,data);
            const val = await res?.data
            set({ DocumentLink: val, DocumentLinkLoad: false })
        }
        catch (error) {
            set({ DocumentLinkLoad: false })
            console.error('Failed to fetch', error);
        }
    }
}));

export default GetDocumentLink
