import { create } from 'zustand';

type Severity = 'success' | 'error' | 'info' | 'warning'; // optional extra severities

interface SnackbarState {
  open: boolean;
  message: string;
  severity: Severity;
  showSnackbar: (message: string, severity: Severity) => void;
  closeSnackbar: () => void;
}

const useSnackbarStore = create<SnackbarState>((set) => ({
  open: false,
  message: '',
  severity: 'success',
  showSnackbar: (message, severity) =>
    set({ open: true, message, severity }),
  closeSnackbar: () => set({ open: false }),
}));

export default useSnackbarStore;
