'use client'

import { create } from 'zustand'

interface CourseTabsState {
  tab: string
  isLocked: boolean
  courseId: string | null
  setTab: (tab: string) => void
  lockTabs: () => void
  unlockTabs: () => void
  setCourseId: (id: string | null) => void
  resetTabs: () => void
}

export const useCourseTabsStore = create<CourseTabsState>((set) => ({
  tab: 'title',
  isLocked: true,
  courseId: null,

  setTab: (tab) => set({ tab }),
  lockTabs: () => set({ isLocked: true }),
  unlockTabs: () => set({ isLocked: false }),
  setCourseId: (id) => set({ courseId: id }),

  resetTabs: () => set({ tab: 'title', isLocked: true, courseId: null }),
}))