// src/store/loaderStore.ts
import {create} from 'zustand';

interface LoaderState {
  loading: boolean;
  setLoading: (isLoading: boolean) => void;

  RouterLoader: boolean,
  setRouterLoader: (RouterLoader : boolean) => void
}

const useLoaderStore = create<LoaderState>((set) => ({
  loading: false,
  setLoading: (isLoading) => set({ loading: isLoading }),

  RouterLoader: false,
  setRouterLoader: (newModal:boolean) => set({ RouterLoader: newModal }),
}));

// interface Property {
//   id: string;
//   [key: string]: any;
//   images?: any[];
// }

// interface Property {
//   id: string;
//   images?: { url: string; [key: string]: unknown }[]; // or a more specific type if you know the structure
//   [key: string]: unknown; // Use unknown instead of any
// }

// interface PropertyStore {
//   allProperties: Property[];
//   propertyImages: { [propertyId: string]: any[] };
//   loading: boolean;
//   fetchAllPropertiesAndImages: (params: any) => Promise<void>;
// }
// interface PropertyImage {
//   url: string;
//   [key: string]: unknown;
// }


// interface PropertyStore {
//   allProperties: Property[];
//   propertyImages: { [propertyId: string]: PropertyImage[] };
//   loading: boolean;
//   fetchAllPropertiesAndImages: (params: Record<string, unknown>) => Promise<void>;
// }


// const usePropertyStore = create<PropertyStore>((set, get) => ({
//   allProperties: [],
//   propertyImages: {},
//   loading: false,

//   fetchAllPropertiesAndImages: async (params) => {
//     set({ loading: true });
//     // 1. Fetch all properties
//     const res = await API.GET('api/webmegler/properties/employee', params);
//     const properties = res?.data || [];
//     set({ allProperties: properties });

//     // 2. Fetch all images for each property (one-time)
//     const imagesMap: { [propertyId: string]: any[] } = {};
//     await Promise.all(
//       properties.map(async (prop: Property) => {
//         const imgRes = await API.GET('api/webmegler/properties/images', {
//           tenantId: 381,
//           propertyId: prop.id,
//         });
//         imagesMap[prop.id] = imgRes?.data || [];
//       })
//     );
//     set({ propertyImages: imagesMap, loading: false });
//   },
// }));

export default useLoaderStore;
