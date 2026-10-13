import type { HistoryState, HistoryAction } from "./types";

export function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case "set": {
      const past = [...state.past, state.present];
      return { past, present: action.payload, future: [] };
    }
    case "live":
      return { ...state, present: action.payload };
    case "undo": {
      if (!state.past.length) return state;
      const past = state.past.slice(0, -1);
      const present = state.past[state.past.length - 1];
      return { past, present, future: [state.present, ...state.future] };
    }
    case "redo": {
      if (!state.future.length) return state;
      const [present, ...future] = state.future;
      return { past: [...state.past, state.present], present, future };
    }
    case "reset":
      return { past: [], present: action.payload, future: [] };
  }
}
