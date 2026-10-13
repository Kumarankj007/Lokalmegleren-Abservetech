import { useReducer, useMemo, useRef, useState, useEffect, useCallback } from "react";

import { historyReducer } from "../history";
import { blankPage } from "../utils/factories";
import { scopeGlobalCss } from "../utils/css";
import { CANVAS_SCOPE } from "../constants";
import type { EditorModel } from "../types";

export function useEditorHistory(onChange?: (model: EditorModel) => void) {
  const [history, dispatch] = useReducer(historyReducer, null, () => ({
    past: [],
    present: { pages: [blankPage()], globalStyles: "" },
    future: [],
  }));

  const model = useMemo(() => ({
    ...history.present,
    pages: history.present?.pages?.map((d, i) => ({
      ...d,
      name: `Side ${i + 1}`,
    })),
  }), [history.present]);

  const modelRef = useRef(model);
  modelRef.current = model;

  const scopedCss = useMemo(() => scopeGlobalCss(model.globalStyles, CANVAS_SCOPE), [model.globalStyles]);
  const [isLoading, setIsLoading] = useState(false);

  // Use a ref to call onChange so the effect doesn't need to re-run when
  // either `model` object identity or `onChange` reference changes.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  useEffect(() => { onChangeRef.current?.(model); }, [model]);

  const updateModel = useCallback((m: EditorModel) => dispatch({ type: "set", payload: m }), []);

  return { history, dispatch, model, modelRef, scopedCss, isLoading, setIsLoading, updateModel };
}
