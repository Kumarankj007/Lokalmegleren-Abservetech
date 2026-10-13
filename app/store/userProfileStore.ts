// "use client";

// import { create } from "zustand";
// import { APICONSTANT } from "@/services/config";
// import { fetchApi, getApiMethos } from "@/services/global";

// interface ProfilePic {
//   url: string;
//   public_id: string;
// }

// interface ProfileData {
//   firstname: string;
//   lastname: string;
//   email: string;
//   profilePic?: ProfilePic | null;
//   role?: string;
//   phone?: string;
//   country_name?: string;
//   state_name?: string;
//   city?: string;
//   street?: string;
// }

// interface ProfileState {
//   profile: ProfileData | null;
//   loading: boolean;
//   error: string | null;
//   fetchProfile: () => Promise<void>;
// }

// export const useProfileStore = create<ProfileState>((set) => ({
//   profile: null,
//   loading: false,
//   error: null,
//   fetchProfile: async () => {
//     try {
//       set({ loading: true, error: null });
//       const response = await fetchApi<{ data: ProfileData }>(
//         APICONSTANT.GET_PROFILE
//       );
//       set({ profile: response.data, loading: false });
//     } catch (err: any) {
//       set({ error: err.message ?? "Failed to fetch profile", loading: false });
//     }
//   },
// }));

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { APICONSTANT } from "@/services/config";
import { fetchApi } from "@/services/global";
import { getUser } from "@/services/authService";

interface ProfilePic {
  url: string;
  public_id: string;
}

interface ProfileData {
  firstname: string;
  lastname: string;
  email: string;
  profilePic?: ProfilePic | null;
  role?: string;
  phone?: string;
  country_name?: string;
  state_name?: string;
  city?: string;
  street?: string;
}

interface ProfileState {
  profile: ProfileData | null;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      loading: false,
      error: null,
      fetchProfile: async () => {
        try {
          set({ loading: true, error: null });
          // const response = await fetchApi<{ data: ProfileData }>(
          //   APICONSTANT.GET_PROFILE
          // );
          const response = JSON.parse(getUser() || "{}");
          set({ profile: response, loading: false });
        } catch (err: any) {
          set({ error: err.message ?? "Failed to fetch profile", loading: false });
        }
      },
      clearProfile: () => set({ profile: null }), // useful on logout
    }),
    {
      name: "profile-storage", // localStorage key
      partialize: (state) => ({ profile: state.profile }), // only persist profile, not loading/error
    }
  )
);