'use client'
import { create } from 'zustand'
import { APICONSTANT } from '@/services/config'
import { fetchApi } from '@/services/global'

interface EditCourseData {
  id?: string
  title?: string
  status?: string
  description?: string
  curriculum?: any
  learningOutcomes?: any
  pricing?: any
  media?: any
  [key: string]: any // allow flexible fields
}

interface EditCourseState {
  editCourse: EditCourseData | null
  loading: boolean
  error: string | null
  fetchEditCourse: (courseId: string) => Promise<void>
  setEditCourse: (data: Partial<EditCourseData>) => void
  clearEditCourse: () => void
}

export const useEditCourseStore = create<EditCourseState>((set) => ({
  editCourse: null,
  loading: false,
  error: null,

  fetchEditCourse: async (courseId) => {
    try {
      set({ loading: true, error: null })
      const response = await fetchApi<{ data: EditCourseData }>(
        `${APICONSTANT.GET_EDIT_COURSES}/${courseId}`
      )
      set({ editCourse: response.data, loading: false })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch course data'
      set({ error: message, loading: false })
    }
  },

  setEditCourse: (data) =>
    set((state) => ({
      editCourse: state.editCourse
        ? { ...state.editCourse, ...data }
        : { ...data },
    })),

  clearEditCourse: () => set({ editCourse: null, loading: false, error: null }),
}))
