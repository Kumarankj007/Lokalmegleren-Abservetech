import type { CSSProperties } from "react";
import { SNAP_THRESHOLD } from "../constants";
import type { HandleDir } from "../constants";
import type { Guideline } from "../types";

export function computeGuidelines(
  x: number, y: number, w: number, h: number, pageW: number, pageH: number,
): { snappedX: number; snappedY: number; guidelines: Guideline[] } {
  const lines: Guideline[] = [];
  let sx = x;
  let sy = y;
  const pageCX = pageW / 2;
  const pageCY = pageH / 2;
  const elCX = x + w / 2;
  const elCY = y + h / 2;

  const vAnchors = [
    { elEdge: elCX, pageAnchor: pageCX, label: "Senter" },
    { elEdge: x, pageAnchor: pageCX, label: "Senter" },
    { elEdge: x + w, pageAnchor: pageCX, label: "Senter" },
    { elEdge: x, pageAnchor: 0, label: "Kant" },
    { elEdge: x + w, pageAnchor: pageW, label: "Kant" },
  ];
  for (const { elEdge, pageAnchor, label } of vAnchors) {
    if (Math.abs(elEdge - pageAnchor) <= SNAP_THRESHOLD) {
      sx = x + (pageAnchor - elEdge);
      lines.push({ axis: "v", pos: pageAnchor, label });
      break;
    }
  }

  const hAnchors = [
    { elEdge: elCY, pageAnchor: pageCY, label: "Senter" },
    { elEdge: y, pageAnchor: pageCY, label: "Senter" },
    { elEdge: y + h, pageAnchor: pageCY, label: "Senter" },
    { elEdge: y, pageAnchor: 0, label: "Kant" },
    { elEdge: y + h, pageAnchor: pageH, label: "Kant" },
  ];
  for (const { elEdge, pageAnchor, label } of hAnchors) {
    if (Math.abs(elEdge - pageAnchor) <= SNAP_THRESHOLD) {
      sy = y + (pageAnchor - elEdge);
      lines.push({ axis: "h", pos: pageAnchor, label });
      break;
    }
  }

  return { snappedX: sx, snappedY: sy, guidelines: lines };
}

export function handlePos(h: HandleDir): CSSProperties {
  const e = -4;
  const m = "calc(50% - 4px)";
  const map: Record<HandleDir, CSSProperties> = {
    nw: { left: e, top: e }, n: { left: m, top: e }, ne: { right: e, top: e },
    e: { right: e, top: m }, se: { right: e, bottom: e }, s: { left: m, bottom: e },
    sw: { left: e, bottom: e }, w: { left: e, top: m },
  };
  return map[h];
}
export function handleCursor(h: HandleDir): string {
  return { n: "ns-resize", s: "ns-resize", e: "ew-resize", w: "ew-resize", ne: "nesw-resize", sw: "nesw-resize", nw: "nwse-resize", se: "nwse-resize" }[h];
}
