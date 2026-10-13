import type { Page } from "../types";

export async function cropImageHorizontal(
  src: string,
  startFraction: number,
  endFraction: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const startX = Math.max(0, Math.min(w - 1, Math.floor(w * startFraction)));
      const endX = Math.max(startX + 1, Math.min(w, Math.ceil(w * endFraction)));
      const cropWidth = endX - startX;
      const canvas = document.createElement("canvas");
      canvas.width = cropWidth;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, startX, 0, cropWidth, h, 0, 0, cropWidth, h);
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.onerror = () => reject(new Error("Failed to load image — CORS may be blocking canvas access"));
    img.src = src;
  });
}

export async function loadImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 800, height: 600 });
    img.src = src;
  });
}

export async function cropImageVerticalPixels(src: string, startY: number, endY: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const sY = Math.max(0, Math.min(h - 1, Math.floor(startY)));
      const eY = Math.max(sY + 1, Math.min(h, Math.ceil(endY)));
      const cropHeight = eY - sY;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = cropHeight;
      canvas.getContext("2d")!.drawImage(img, 0, sY, w, cropHeight, 0, 0, w, cropHeight);
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.onerror = () => reject(new Error("Failed to load image — CORS may be blocking canvas access"));
    img.src = src;
  });
}

export async function cropImageRect(
  src: string, sx: number, sy: number, sw: number, sh: number, dw: number, dh: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const natW = img.naturalWidth;
      const natH = img.naturalHeight;
      const cSX = Math.max(0, Math.min(natW - 1, Math.round(sx)));
      const cSY = Math.max(0, Math.min(natH - 1, Math.round(sy)));
      const cSW = Math.max(1, Math.min(natW - cSX, Math.round(sw)));
      const cSH = Math.max(1, Math.min(natH - cSY, Math.round(sh)));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(dw));
      canvas.height = Math.max(1, Math.round(dh));
      canvas.getContext("2d")!.drawImage(img, cSX, cSY, cSW, cSH, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.onerror = () => reject(new Error("Failed to load image — CORS may be blocking canvas access"));
    img.src = src;
  });
}

export async function fitImageToPage(
  src: string, page: Page, dropX: number, dropY: number,
): Promise<{ x: number; y: number; width: number; height: number }> {
  const { width: natW, height: natH } = await loadImageDimensions(src);
  const aspect = natW > 0 && natH > 0 ? natH / natW : 0.75;

  let w = Math.min(page.width * 0.45, natW > 0 ? natW : page.width * 0.45);
  if (w < 200) w = Math.min(page.width * 0.45, 300);
  let h = w * aspect;
  if (w > page.width) { w = page.width; h = w * aspect; }
  if (h > page.height) { h = page.height; w = aspect > 0 ? h / aspect : page.width; }
  w = Math.round(w);
  h = Math.round(h);

  const others = page.elements.filter((e) => e.type === "image" && !e.spanning);
  const overlaps = (ax: number, ay: number) =>
    others.some((e) => ax < e.x + e.width && ax + w > e.x && ay < e.y + e.height && ay + h > e.y);
  const clamp = (vx: number, vy: number): [number, number] => [
    Math.max(0, Math.min(page.width - w, vx)),
    Math.max(0, Math.min(page.height - h, vy)),
  ];

  let [x, y] = clamp(Math.round(dropX - w / 2), Math.round(dropY - h / 2));

  if (overlaps(x, y)) {
    const stepX = Math.max(16, Math.round(w / 2));
    const stepY = Math.max(16, Math.round(h / 2));
    let placed = false;
    for (let gy = 0; gy + h <= page.height && !placed; gy += stepY) {
      for (let gx = 0; gx + w <= page.width && !placed; gx += stepX) {
        if (!overlaps(gx, gy)) { x = gx; y = gy; placed = true; }
      }
    }
  }

  return { x, y, width: w, height: h };
}
