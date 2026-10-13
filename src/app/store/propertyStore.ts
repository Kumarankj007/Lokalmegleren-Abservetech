// Property store for one-time property and image loading/caching
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { API } from "@/app/helper/apitools";
import { indexedDBStorage } from "./indexedDBStorage";

interface PropertyImage {
  url: string;
  [key: string]: unknown;
}

interface Property {
  id: string;
  images?: PropertyImage[];
  [key: string]: unknown;
}

// How many property-image requests may be in flight at once. High enough to
// hide latency, low enough not to saturate the connection or the API.
const IMAGE_BATCH_SIZE = 6;

interface PropertyStore {
  propertyCache: { [key: string]: Property[] };
  propertyImagesCache: {
    [key: string]: { [propertyId: string]: PropertyImage[] };
  };
  loading: boolean;
  // Distinguishes "no results" from "hasn't loaded yet" - without it the empty
  // state flashes before the first response arrives.
  ready: boolean;
  // Incremented per request so a slow response from an abandoned filter can be
  // discarded instead of overwriting the current one.
  requestId: number;
  lastSortBy: string;
  propertiesprice: number;
  propertiesmaxBedroom: number;
  fetchAllPropertiesAndImages: (
    params: Record<string, unknown>,
    options?: { imageLimit?: number }
  ) => Promise<void>;
  setLastSortBy: (sortBy: string) => void;
}

const usePropertyStore = create<PropertyStore>()(
  persist(
    (set, get) => ({
      propertyCache: {},
      propertyImagesCache: {},
      loading: false,
      ready: false,
      requestId: 0,
      lastSortBy: "",
      propertiesprice: 0,
      propertiesmaxBedroom: 0,
      setLastSortBy: (sortBy) => set({ lastSortBy: sortBy }),
      fetchAllPropertiesAndImages: async (params, options) => {
        // Always ensure cacheKey is a string
        const sortBy = typeof params.sortBy === "string" ? params.sortBy : "";
        let cacheKey: string = sortBy;

        if (params.minPrice !== undefined && params.maxPrice !== undefined) {
          cacheKey = `minPrice=${params.minPrice}&maxPrice=${params.maxPrice}`;
          if (params.sortBy) {
            cacheKey += `&sortBy=${params.sortBy}`;
          }
        }
        if (params.location && params?.location != "") {
          cacheKey += `&location=${params.location}`;
        }

        const {
          propertyCache,
          propertyImagesCache,
          propertiesprice,
          propertiesmaxBedroom,
        } = get();

        const requestId = get().requestId + 1;
        set({ requestId, lastSortBy: cacheKey });

        // Stale-while-revalidate: if this key is already cached (it persists to
        // IndexedDB) show it straight away and refresh in the background, so a
        // repeat visit or a return to a previous filter is instant.
        const hasCache =
          Array.isArray(propertyCache[cacheKey]) && !!propertyImagesCache[cacheKey];
        set({ loading: !hasCache });

        // 1. Await employee properties response
        let res;
        try {
          res = await API.GET("api/webmegler/properties/employee", params);
        } catch (err) {
          console.error("Failed to fetch properties", err);
          if (get().requestId === requestId) set({ loading: false, ready: true });
          return;
        }

        // A newer request superseded this one while it was in flight.
        if (get().requestId !== requestId) return;

        if(res?.message == "Properties Listed"){

          const propertiesprices = propertiesprice == 0
            ? res?.maxPrice
            : propertiesprice;
          const propertiesmaxBedrooms = propertiesmaxBedroom == 0
            ? res?.maxBedroom
            : propertiesmaxBedroom;
          const properties = res?.data || [];
  
          // 3. Update the store after all images are fetched
          set({
            propertyCache: { ...propertyCache, [cacheKey]: properties },
            lastSortBy: cacheKey,
            loading: false,
            ready: true,
            propertiesprice: propertiesprices,
            propertiesmaxBedroom: propertiesmaxBedrooms,
          });
  
          // Only proceed to fetch images if properties are received
          if (Array.isArray(properties) && properties.length > 0) {
            // Images used to be fetched strictly one after another, so a list
            // of N properties cost N sequential round trips. Fetch them in
            // parallel batches instead, committing each batch so cards fill in
            // progressively rather than all at the very end.
            const acc: { [propertyId: string]: PropertyImage[] } = {};

            // Callers that only render the first few cards (the homepage shows
            // 4) shouldn't pay for every property's images.
            const needsImages =
              typeof options?.imageLimit === "number"
                ? properties.slice(0, options.imageLimit)
                : properties;

            for (let i = 0; i < needsImages.length; i += IMAGE_BATCH_SIZE) {
              const batch = needsImages.slice(i, i + IMAGE_BATCH_SIZE);

              await Promise.all(
                batch.map(async (prop: Property) => {
                  try {
                    const imgRes = await API.GET(
                      "api/webmegler/properties/images",
                      { tenantId: params.tenantId, propertyId: prop.id }
                    );
                    acc[prop.id] = imgRes?.data || [];
                  } catch {
                    // One bad property must not stall the rest of the grid.
                    acc[prop.id] = [];
                  }
                })
              );

              // A newer search/filter has started - drop these results rather
              // than overwriting the newer list's images.
              if (get().requestId !== requestId) return;

              set({
                propertyImagesCache: {
                  ...get().propertyImagesCache,
                  [cacheKey]: { ...acc },
                },
              });
            }
          } else {
            set({
              propertyImagesCache: {
                ...get().propertyImagesCache,
                [cacheKey]: {},
              },
            });
          }
        }else{
          // Anything other than a successful listing still has to settle the
          // loading flags, otherwise the grid spins on skeletons forever.
          console.log(res?.message, 'status code list')
          set({ loading: false, ready: true });
        }
      },
    }),
    {
      name: "property-storage",
      storage: indexedDBStorage,
      partialize: (state) => ({
        propertyCache: state.propertyCache,
        propertyImagesCache: state.propertyImagesCache,
        lastSortBy: state.lastSortBy,
        propertiesprice: state.propertiesprice,
        propertiesmaxBedroom: state.propertiesmaxBedroom,
      }),
    }
  )
);

export default usePropertyStore;
