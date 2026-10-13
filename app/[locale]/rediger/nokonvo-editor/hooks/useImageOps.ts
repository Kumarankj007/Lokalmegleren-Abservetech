import React, { useCallback } from "react";

import { genId, defaultElement, blankPage } from "../utils/factories";
import { loadImageDimensions, cropImageRect, fitImageToPage } from "../utils/image";
import type { CanvasElement, Page, EditorModel } from "../types";
import type { EditorPermissions } from "../utils/permissions";

export function useImageOps(opts: {
  model: EditorModel;
  modelRef: React.MutableRefObject<EditorModel>;
  updateModel: (m: EditorModel) => void;
  selectedEl: CanvasElement | null;
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  permissions: EditorPermissions;
}) {
  const { model, modelRef, updateModel, selectedEl, setSelectedId, permissions } = opts;

  const handleDropImageOnPage = useCallback(async (src: string, x: number, y: number, targetIdx: number) => {
    // Dropping an image onto a page creates a NEW element — admins only.
    // (Replacing an existing image via the sidebar is content editing and stays.)
    if (!permissions.canAddElements) return;
    const page = modelRef.current.pages[targetIdx];
    if (!page) return;
    const { x: fx, y: fy, width, height } = await fitImageToPage(src, page, x, y);
    const el: CanvasElement = { ...defaultElement("image"), src, x: fx, y: fy, width, height };
    const m = modelRef.current;
    updateModel({ ...m, pages: m.pages.map((p, i) => i !== targetIdx ? p : { ...p, elements: [...p.elements, el] }) });
    setSelectedId(el.id);
  }, [updateModel, permissions]);

  const handleDropImageToCell = useCallback((elId: string, cellIndex: number, src: string) => {
    const m = modelRef.current;
    updateModel({
      ...m, pages: m.pages.map((p) => ({
        ...p, elements: p.elements.map((e) => {
          if (e.id !== elId || e.type !== "collage") return e;
          return { ...e, collageCells: e.collageCells.map((c, i) => i === cellIndex ? { ...c, src, scale: 1, posX: 50, posY: 50 } : c) };
        }),
      })),
    });
    setSelectedId(elId);
  }, [updateModel]);

  const handleSpreadDrop = async (src: string, _x: number, _y: number, leftIdx: number) => {
    // Dropping across a spread creates a new (spanning) element — admins only.
    if (!permissions.canAddElements) return;
    const rightIdx = leftIdx + 1;
    if (!model.pages[rightIdx] || leftIdx === 0) { handleDropImageOnPage(src, _x, _y, leftIdx); return; }
    const leftPage = model.pages[leftIdx];
    const rightPage = model.pages[rightIdx];
    const spreadWidth = leftPage.width + rightPage.width;
    const spanningEl: CanvasElement = { ...defaultElement("image"), id: genId("image"), src, x: 0, y: 0, width: spreadWidth, height: leftPage.height, objectFit: "cover", spanning: true };
    updateModel({ ...model, pages: model.pages.map((p, i) => i === leftIdx ? { ...p, elements: [...p.elements, spanningEl] } : p) });
    setSelectedId(spanningEl.id);
  };

  const splitImage = async () => {
    // Splitting a spanning image creates a new element — admins only.
    if (!permissions.canAddElements) return;
    if (!selectedEl || !selectedEl.spanning) return;
    let leftPageIdx = -1;
    let el: CanvasElement | null = null;
    for (let i = 0; i < model.pages.length; i++) {
      const found = model.pages[i].elements.find((e) => e.id === selectedEl.id);
      if (found) { el = found; leftPageIdx = i; break; }
    }
    if (!el || leftPageIdx === -1 || leftPageIdx + 1 >= model.pages.length) return;
    const rightPageIdx = leftPageIdx + 1;
    const leftPage = model.pages[leftPageIdx];
    const rightPage = model.pages[rightPageIdx];

    const elementRight = el.x + el.width;
    const leftElW = Math.min(elementRight, leftPage.width) - Math.max(0, el.x);
    const rightElW = Math.max(0, elementRight - leftPage.width);

    if (leftElW <= 0) {
      alert("Bildet er ikke på venstre side. Flytt det slik at det er på venstre side."); return;
    }

    try {
      const { width: natW, height: natH } = await loadImageDimensions(el.src);

      // Reproduce EXACTLY how a framed image renders (serializer.ts + ElementView):
      // object-fit + object-position(px%,py%) place the natural image in the box,
      // THEN transform:scale(s) is applied about transform-origin(px%,py%). We invert
      // that map so each half is cut from the SOURCE pixels actually visible, then
      // bake it with object-fit:"fill". Without this the split ignored the admin's
      // zoom (imageScale) and Posisjon X/Y (imagePosX/Y) and re-cut the un-zoomed,
      // centred image — the reported "not the exact edited version". (For an unframed
      // image — scale 1, pos 50/50 — this reduces to the previous centred-cover math.)
      const W = el.width;
      const H = el.height;
      const s = el.imageScale ?? 1;
      const fx = (el.imagePosX ?? 50) / 100;
      const fy = (el.imagePosY ?? 50) / 100;
      const fitMode = el.objectFit || "cover";

      let fitX: number, fitY: number, imgLeft: number, imgTop: number;
      if (fitMode === "fill") {
        fitX = W / natW; fitY = H / natH; imgLeft = 0; imgTop = 0;
      } else {
        const f = fitMode === "contain"
          ? Math.min(W / natW, H / natH)
          : Math.max(W / natW, H / natH); // "cover" (default)
        fitX = f; fitY = f;
        imgLeft = -(natW * f - W) * fx; // object-position horizontal offset
        imgTop = -(natH * f - H) * fy;  // object-position vertical offset
      }
      const ox = W * fx; // transform-origin, in box px
      const oy = H * fy;
      // box-local coordinate → natural-image pixel: undo scale about the origin,
      // then undo the object-fit/object-position placement. x and y are independent
      // because there is no rotation on a spanning image.
      const nx = (bx: number) => (ox + (bx - ox) / s - imgLeft) / fitX;
      const ny = (by: number) => (oy + (by - oy) / s - imgTop) / fitY;

      // Box-local x runs 0..W across the spread; the split is at the page edge.
      const splitBoxX = leftPage.width - el.x;
      const leftBoxStart = Math.max(0, -el.x);
      const srcY = ny(0);
      const srcH = ny(H) - srcY;

      const leftNX0 = nx(leftBoxStart);
      const leftCrop = await cropImageRect(
        el.src, leftNX0, srcY, nx(splitBoxX) - leftNX0, srcH, leftElW, el.height,
      );
      const leftHalf: CanvasElement = {
        ...el,
        src: leftCrop,
        x: Math.max(0, el.x),
        width: leftElW,
        objectFit: "fill",
        imageScale: 1,
        imagePosX: 50,
        imagePosY: 50,
        spanning: false,
      };

      if (rightElW <= 0) {
        updateModel({
          ...model,
          pages: model.pages.map((p, i) =>
            i !== leftPageIdx ? p : {
              ...p, elements: p.elements.map((e) => e.id === selectedEl.id ? leftHalf : e),
            }
          ),
        });
        setSelectedId(leftHalf.id);
        return;
      }

      const rightNX0 = nx(splitBoxX);
      const rightCrop = await cropImageRect(
        el.src, rightNX0, srcY, nx(splitBoxX + rightElW) - rightNX0, srcH, rightElW, el.height,
      );
      const rightHalf: CanvasElement = {
        ...defaultElement("image"),
        id: genId("image"),
        src: rightCrop,
        x: 0,
        y: el.y,
        width: rightElW,
        height: el.height,
        objectFit: "fill",
        opacity: el.opacity,
        rotation: el.rotation,
        zIndex: el.zIndex,
        spanning: false,
      };

      updateModel({
        ...model, pages: model.pages.map((p, i) => {
          if (i === leftPageIdx) return { ...p, elements: p.elements.map((e) => e.id === selectedEl.id ? leftHalf : e) };
          if (i === rightPageIdx) return { ...p, elements: [...p.elements, rightHalf] };
          return p;
        }),
      });
      setSelectedId(leftHalf.id);
    } catch (err) {
      console.error("Split failed:", err);
      alert("Kunne ikke dele bildet — CORS kan blokkere canvas-tilgangen.");
    }
  };

  const addRightPageInSpread = (leftIdx: number) => {
    // Adding a page in the spread is a page-structure action — admins only.
    if (!permissions.canManagePages) return;
    const p: Page = { ...blankPage(), name: `Side ${model.pages.length + 1}` };
    const newPages = [...model.pages.slice(0, leftIdx + 1), p, ...model.pages.slice(leftIdx + 1)];
    updateModel({ ...model, pages: newPages });
  };

  return { handleDropImageOnPage, handleDropImageToCell, handleSpreadDrop, splitImage, addRightPageInSpread };
}
