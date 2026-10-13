export function rgbaToCss(c: string): string {
  if (!c || c === "rgba(0, 0, 0, 0)" || c === "transparent") return "";
  return c;
}
