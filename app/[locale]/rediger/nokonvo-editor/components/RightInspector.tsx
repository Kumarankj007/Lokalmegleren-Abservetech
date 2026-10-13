"use client";

import { T } from "../constants";
import type { CanvasElement, FlowBlock, FlowBlockStyle, Page } from "../types";

import Inspector from "./Inspector";

interface RightInspectorProps {
  el: CanvasElement | null;
  page: Page | null;
  onChange: (el: CanvasElement) => void;
  onChangePage: (p: Page) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onSplit?: () => void;
  onCopy?: () => void;
  onDeletePage: () => void;
  // The selected accordion flow LINE, edited through the full text inspector.
  flowBlock?: {
    block: FlowBlock;
    seed?: FlowBlockStyle;
    onChange: (el: CanvasElement) => void;
    onChangeTag: (tag: string) => void;
    onDelete: () => void;
    onDuplicate: () => void;
  } | null;
}

export default function RightInspector({ el, page, onChange, onChangePage, onDelete, onDuplicate, onSplit, onCopy, onDeletePage, flowBlock }: RightInspectorProps) {
  return (
    <div style={{ width: "clamp(250px, 22vw, 300px)", background: T.panel, borderLeft: `1px solid ${T.border}`, overflowY: "auto", flexShrink: 0 }}>
      <Inspector
        el={el}
        page={page}
        onChange={onChange}
        onChangePage={onChangePage}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onSplit={onSplit}
        onCopy={onCopy}
        onDeletePage={onDeletePage}
        flowBlock={flowBlock}
      />
    </div>
  );
}
