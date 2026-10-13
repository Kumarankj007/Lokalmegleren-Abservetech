// src/store/loaderStore.ts
import { create } from "zustand";

interface LoaderState {
  ogImg: string;
  setImg: (ogImg: string) => void;
}

const useRootStore = create<LoaderState>((set) => ({
  ogImg: "",
  setImg: (ogImg) => set({ ogImg: ogImg }),
}));

export default useRootStore;
