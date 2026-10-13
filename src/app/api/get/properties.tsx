/* eslint-disable @typescript-eslint/no-explicit-any */
import { API } from '@/app/helper/apitools';
import { create } from 'zustand';

interface Property {
  id: string;
  [key: string]: any;
  images?: any[];
}

interface PropertyStore {
  allProperties: Property[];
  setallProperties: (data: any) => void;
  visibleProperties: Property[];
  propertyLoadIndex: number;
  setpropertyLoadIndex: (data: any) => void
  setvisibleProperties: (data: any) => void
  propertyBatchSize: number;
  hasMore: boolean;
  loadingProperties: boolean;
  loadingImages: boolean;
  maxPrice: number
  FetchAllProperties: (params: any) => Promise<void>;
  LoadNextBatch: () => Promise<void>;
  

  singlepropertiesImage: [],
  singleImagesLoad: boolean;
  FetchSinglePropertiesImage: (data: any) => Promise<void>
}

const usePropertyStore = create<PropertyStore>((set, get) => ({
  allProperties: [],
  setallProperties: (data: any) => set({ allProperties: data }),
  visibleProperties: [],
  propertyLoadIndex: 0,
  setpropertyLoadIndex: (data: any) => set({ propertyLoadIndex: data }),
  setvisibleProperties: (data: any) => set({ visibleProperties: data }),
  propertyBatchSize: 5,
  hasMore: true,
  loadingProperties: false,
  loadingImages: false,
  maxPrice: 0,

  FetchAllProperties: async (params: any) => {
    // debugger
    set({ loadingProperties: true });
    set({ visibleProperties: [] })
    try {
      const res = await API.GET('api/webmegler/properties/employee', params);
      const allProps = res?.data || [];
      set({ loadingProperties: false });
      set({ allProperties: allProps, propertyLoadIndex: 0, hasMore: true, maxPrice: res?.maxPrice });
      await get().LoadNextBatch(); // Load first batch with images
    } catch (err) {
      console.error('Failed to fetch all properties:', err);
    } finally {
      set({ loadingProperties: false });
    }
  },

  LoadNextBatch: async () => {
    const {
      allProperties,
      propertyLoadIndex,
      propertyBatchSize,
      visibleProperties,
      loadingImages,
      hasMore,
    } = get();

    if (loadingImages || !hasMore) return;
    // debugger
    const nextBatch = allProperties.slice(propertyLoadIndex, propertyLoadIndex + propertyBatchSize);
    if (nextBatch.length === 0) {
      set({ hasMore: false });
      return;
    }

    set({ loadingImages: true });

    const updatedBatch: Property[] = [];

    for (const prop of nextBatch) {
      try {
        // debugger

        const res = await API.GET('api/webmegler/properties/images', {
          tenantId: 381,
          propertyId: prop.id,
        });
        const images = res?.data || [];
        updatedBatch.push({ ...prop, images });
      } catch (err) {
        console.error(`Failed to fetch images for property ${prop.id}`, err);
        updatedBatch.push({ ...prop, images: [] });
      }
    }

    set({
      visibleProperties: [...visibleProperties, ...updatedBatch],
      propertyLoadIndex: propertyLoadIndex + propertyBatchSize,
      hasMore: propertyLoadIndex + propertyBatchSize < allProperties.length,
      loadingImages: false,
    });
  },


  singlepropertiesImage: [],
  // Dedicated flag: `loadingImages` is shared with the listing batch loader and
  // would otherwise flip the detail gallery in and out of its skeleton.
  singleImagesLoad: true,
  FetchSinglePropertiesImage: async (data: any) => {
    try {
      set({ singleImagesLoad: true });
      const res = await API.GET('api/webmegler/properties/images', data);
      const val = await res?.data;
      set({ singlepropertiesImage: val, singleImagesLoad: false })
      return val
    }
    catch (error) {
      set({ singleImagesLoad: false });
      console.error('Failed to fetch', error);
    }
  }
}));

export default usePropertyStore;

// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';
// import { API } from '@/app/helper/apitools';

// interface ImageData {
//   url: string;
//   [key: string]: unknown;
// }

// interface Property {
//   id: string;
//   [key: string]: unknown;
//   images?: ImageData[];
// }

// interface FetchParams {
//   tenantId: number;
//   employeeId: number;
//   propertyType?: string;
//   sortBy?: string;
//   bedroom?: number;
//   minPrice?: number;
//   maxPrice?: number;
//   [key: string]: unknown;
// }

// interface ImageParams {
//   tenantId: number;
//   propertyId: string;
// }

// interface PropertyStore {
//   allProperties: Property[];
//   setallProperties: (data: Property[]) => void;
//   visibleProperties: Property[];
//   propertyLoadIndex: number;
//   setpropertyLoadIndex: (index: number) => void;
//   setvisibleProperties: (data: Property[]) => void;
//   propertyBatchSize: number;
//   hasMore: boolean;
//   loadingProperties: boolean;
//   loadingImages: boolean;
//   maxPrice: number;
//   alreadyFetched: boolean;
//   FetchAllProperties: (params: FetchParams) => Promise<void>;
//   LoadNextBatch: () => Promise<void>;

//   singlepropertiesImage: ImageData[];
//   FetchSinglePropertiesImage: (params: ImageParams) => Promise<void>;

//   resetStore: () => void;
// }

// const usePropertyStore = create<PropertyStore>()(
//   persist(
//     (set, get) => ({
//       allProperties: [],
//       setallProperties: (data) => set({ allProperties: data }),
//       visibleProperties: [],
//       propertyLoadIndex: 0,
//       setpropertyLoadIndex: (index) => set({ propertyLoadIndex: index }),
//       setvisibleProperties: (data) => set({ visibleProperties: data }),
//       propertyBatchSize: 5,
//       hasMore: true,
//       loadingProperties: false,
//       loadingImages: false,
//       maxPrice: 0,
//       alreadyFetched: false,

//       FetchAllProperties: async (params) => {
//         const { alreadyFetched } = get();
//         if (alreadyFetched) return;

//         set({ loadingProperties: true, visibleProperties: [] });

//         try {
//           const res = await API.GET('api/webmegler/properties/employee', params);
//           const allProps: Property[] = res?.data || [];
//           set({
//             allProperties: allProps,
//             propertyLoadIndex: 0,
//             hasMore: true,
//             maxPrice: res?.maxPrice || 0,
//             alreadyFetched: true,
//           });
//           await get().LoadNextBatch();
//         } catch (err) {
//           console.error('Failed to fetch all properties:', err);
//         } finally {
//           set({ loadingProperties: false });
//         }
//       },

//       LoadNextBatch: async () => {
//         const {
//           allProperties,
//           propertyLoadIndex,
//           propertyBatchSize,
//           visibleProperties,
//           loadingImages,
//           hasMore,
//         } = get();

//         if (loadingImages || !hasMore) return;

//         const nextBatch = allProperties.slice(propertyLoadIndex, propertyLoadIndex + propertyBatchSize);
//         if (nextBatch.length === 0) {
//           set({ hasMore: false });
//           return;
//         }

//         set({ loadingImages: true });

//         const updatedBatch: Property[] = [];

//         for (const prop of nextBatch) {
//           try {
//             const res = await API.GET('api/webmegler/properties/images', {
//               tenantId: 381,
//               propertyId: prop.id,
//             });
//             const images: ImageData[] = res?.data || [];
//             updatedBatch.push({ ...prop, images });
//           } catch (err) {
//             console.error(`Failed to fetch images for property ${prop.id}`, err);
//             updatedBatch.push({ ...prop, images: [] });
//           }
//         }

//         set({
//           visibleProperties: [...visibleProperties, ...updatedBatch],
//           propertyLoadIndex: propertyLoadIndex + propertyBatchSize,
//           hasMore: propertyLoadIndex + propertyBatchSize < allProperties.length,
//           loadingImages: false,
//         });
//       },

//       singlepropertiesImage: [],
//       FetchSinglePropertiesImage: async (params) => {
//         try {
//           const res = await API.GET('api/webmegler/properties/images', params);
//           const images: ImageData[] = res?.data || [];
//           set({ singlepropertiesImage: images });
//         } catch (error) {
//           console.error('Failed to fetch single property images', error);
//         }
//       },

//       resetStore: () =>
//         set({
//           allProperties: [],
//           visibleProperties: [],
//           propertyLoadIndex: 0,
//           hasMore: true,
//           loadingProperties: false,
//           loadingImages: false,
//           maxPrice: 0,
//           alreadyFetched: false,
//           singlepropertiesImage: [],
//         }),
//     }),
//     {
//       name: 'property-storage',
//       partialize: (state) =>
//         ({
//           allProperties: state.allProperties,
//           visibleProperties: state.visibleProperties,
//           propertyLoadIndex: state.propertyLoadIndex,
//           hasMore: state.hasMore,
//           maxPrice: state.maxPrice,
//           alreadyFetched: state.alreadyFetched,
//         }),
//     }
//   )
// );

// export default usePropertyStore;