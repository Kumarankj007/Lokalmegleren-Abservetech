import type { CanvasElement } from "../types";

export function getPath(obj: any, path: string): any {
  if (!path || obj == null) return undefined;
  return path.split(".").reduce((acc: any, key: string) => {
    if (acc == null) return undefined;
    return acc[key.replace("?", "")];
  }, obj);
}

export function formatBinding(value: any, format: string | null): string {
  if (value == null) return "";
  if (format === "currency-no") {
    const n = Number(value);
    return isFinite(n) ? `kr ${n.toLocaleString("no-NO")},-` : String(value);
  }
  if (format === "area-no") {
    const n = Number(value);
    if (!isFinite(n)) return String(value);
    return `${n.toLocaleString("no-NO", { minimumFractionDigits: 1, maximumFractionDigits: 2 })} m²`;
  }
  if (format === "phone-no") {
    return String(value).replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4");
  }
  return String(value);
}

export function resolvePreview(el: CanvasElement, data: Record<string, any>, loopItem: Record<string, any> | null): string {
  if (!el.bind) return el.text;
  const ctx = loopItem ? { ...data, ...loopItem } : data;
  let v = getPath(ctx, el.bind);
  if (v == null) v = el.text || "";
  if (el.bindFormat) v = formatBinding(v, el.bindFormat);
  return `${el.bindPrefix || ""}${v}${el.bindSuffix || ""}`;
}

export function resolveSrc(el: CanvasElement, data: Record<string, any>, loopItem: Record<string, any> | null): string {
  if (el.bindSrc) {
    const ctx = loopItem ? { ...data, ...loopItem } : data;
    const v = getPath(ctx, el.bindSrc);
    if (v) return v;
  }
  return el.src;
}
