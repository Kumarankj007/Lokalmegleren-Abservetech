// import {
//   QueryClient,
//   QueryCache,
// } from '@tanstack/react-query';
// import {
//   persistQueryClient,
//   createSyncStoragePersister,
// } from '@tanstack/react-query-persist-client';

// const queryClient = new QueryClient({
//   queryCache: new QueryCache({
//     onError: (error) => {
//       console.error('React Query Error:', error);
//     },
//   }),
//   defaultOptions: {
//     queries: {
//       retry: 0,
//       staleTime: 5 * 60 * 1000, // 5 mins
//       cacheTime: 24 * 60 * 60 * 1000, // 24 hours
//       keepPreviousData: true,
//     },
//   },
// });

// const persister = createSyncStoragePersister({
//   storage: window.localStorage,
// });

// persistQueryClient({
//   queryClient,
//   persister,
// });

// export default queryClient;

// import {
//     QueryClient,
//     QueryCache,
// } from '@tanstack/react-query';
// import {
//     persistQueryClient,
// } from '@tanstack/react-query-persist-client';

// const queryClient = new QueryClient({
//     queryCache: new QueryCache({
//         onError: (error) => {
//             console.error('React Query Error:', error);
//         },
//     }),
//     defaultOptions: {
//         queries: {
//             retry: 0,
//             //   staleTime: 5 * 60 * 1000, // 5 min
//             //   cacheTime: 24 * 60 * 60 * 1000, // 24 hr
//             //   keepPreviousData: true,
//             gcTime: 1000 * 60 * 60 * 24, // gcTime replaces cacheTime
//             staleTime: 1000 * 60 * 5, // 5 minutes
//             refetchOnWindowFocus: false,
//         },
//     },
// });

// Manual persister using localStorage
// const localStoragePersister = {
//     persistClient: async (client: unknown) => {
//         localStorage.setItem('REACT_QUERY_OFFLINE_CACHE', JSON.stringify(client));
//     },
//     restoreClient: async () => {
//         const cache = localStorage.getItem('REACT_QUERY_OFFLINE_CACHE');
//         return cache ? JSON.parse(cache) : undefined;
//     },
//     removeClient: async () => {
//         localStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
//     },
// };

// Set up persistence
// persistQueryClient({
//     queryClient,
//     persister: localStoragePersister,
//     maxAge: 24 * 60 * 60 * 1000, // 24 hours
// });

// export default queryClient;





// src/services/queryClient.ts

// import { QueryClient, QueryCache } from "@tanstack/react-query";
// import { persistQueryClient } from "@tanstack/react-query-persist-client";

// //  Create a manual persister using localStorage
// // This object tells React Query how to store, retrieve, and remove cache
// const localStoragePersister = {
//   // Called when React Query wants to save the cache
//   persistClient: async (client: unknown) => {
//     localStorage.setItem("REACT_QUERY_OFFLINE_CACHE", JSON.stringify(client));
//   },

//   // Called when React Query starts and wants to restore the cache
//   restoreClient: async () => {
//     const cache = localStorage.getItem("REACT_QUERY_OFFLINE_CACHE");
//     return cache ? JSON.parse(cache) : undefined;
//   },

//   // Called when the cache should be cleared
//   removeClient: async () => {
//     localStorage.removeItem("REACT_QUERY_OFFLINE_CACHE");
//   },
// };

// //  Create a shared QueryClient instance
// export const queryClient = new QueryClient({
//   queryCache: new QueryCache({
//     // Global error handling for all queries
//     onError: (error) => {
//       console.error("React Query Error:", error);
//     },
//   }),
//   defaultOptions: {
//     queries: {
//       retry: 0, // Don’t retry failed queries automatically
//       staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
//       gcTime: 1000 * 60 * 60 * 24, // Garbage collection time (was `cacheTime`) = 24 hours
//       refetchOnWindowFocus: false, // Disable refetching when window regains focus
//     },
//   },
// });

// //  Enable cache persistence
// persistQueryClient({
//   queryClient, // Attach persistence to the QueryClient
//   persister: localStoragePersister, // Use our localStorage persister
//   maxAge: 1000 * 60 * 60 * 24, // Expire cache after 24 hours
// });



// react-query-client.ts
import { QueryClient, QueryCache } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";

// Optional version key to auto-clear old cache after deployment or schema change
const CACHE_VERSION = "v1.0.0";

// LocalStorage keys
const CACHE_KEY = "REACT_QUERY_OFFLINE_CACHE";
const VERSION_KEY = "REACT_QUERY_CACHE_VERSION";

// Clear persisted cache if version changed
const currentVersion = localStorage.getItem(VERSION_KEY);
if (currentVersion !== CACHE_VERSION) {
  localStorage.removeItem(CACHE_KEY);
  localStorage.setItem(VERSION_KEY, CACHE_VERSION);
}

// Create a manual persister using localStorage
const localStoragePersister = {
  persistClient: async (client: unknown) => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(client));
  },

  restoreClient: async () => {
    const cache = localStorage.getItem(CACHE_KEY);
    return cache ? JSON.parse(cache) : undefined;
  },

  removeClient: async () => {
    localStorage.removeItem(CACHE_KEY);
  },
};

// Create a shared QueryClient instance
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      console.error("React Query Error:", error);
    },
  }),
  defaultOptions: {
    queries: {
      retry: 0,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Enable persistent caching
persistQueryClient({
  queryClient,
  persister: localStoragePersister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
});