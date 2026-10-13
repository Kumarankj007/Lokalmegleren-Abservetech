export function findMatchingBrace(src: string, openIdx: number): number {
  let depth = 0;
  for (let i = openIdx; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") { depth--; if (depth === 0) return i; }
  }
  return -1;
}

export function scopeGlobalCss(css: string, scope: string): string {
  if (!css) return "";
  let stripped = css.replace(/@page[^{]*\{[^}]*\}/g, "");
  stripped = stripped.replace(/@media\s+print[^{]*\{(?:[^{}]*|\{[^}]*\})*\}/g, "");
  let i = 0;
  let out = "";
  const len = stripped.length;
  while (i < len) {
    const ch = stripped[i];
    if (/\s/.test(ch)) { out += ch; i++; continue; }
    if (stripped.startsWith("/*", i)) {
      const end = stripped.indexOf("*/", i + 2);
      if (end === -1) break;
      out += stripped.slice(i, end + 2);
      i = end + 2;
      continue;
    }
    if (ch === "@") {
      const blockStart = stripped.indexOf("{", i);
      const semi = stripped.indexOf(";", i);
      if (blockStart === -1 || (semi !== -1 && semi < blockStart)) {
        if (semi === -1) break;
        out += stripped.slice(i, semi + 1);
        i = semi + 1;
        continue;
      }
      const blockEnd = findMatchingBrace(stripped, blockStart);
      if (blockEnd === -1) break;
      const head = stripped.slice(i, blockStart + 1);
      const body = stripped.slice(blockStart + 1, blockEnd);
      out += head + scopeGlobalCss(body, scope) + "}";
      i = blockEnd + 1;
      continue;
    }
    const blockStart = stripped.indexOf("{", i);
    if (blockStart === -1) break;
    const blockEnd = findMatchingBrace(stripped, blockStart);
    if (blockEnd === -1) break;
    const selectorList = stripped.slice(i, blockStart);
    const body = stripped.slice(blockStart + 1, blockEnd);
    const scoped = selectorList
      .split(",")
      .map((s) => {
        const t = s.trim();
        if (!t) return "";
        if (/^(html|body|:root)\b/i.test(t)) return `.${scope}`;
        return `.${scope} ${t}`;
      })
      .filter(Boolean)
      .join(", ");
    out += `${scoped} {${body}}`;
    i = blockEnd + 1;
  }
  return out;
}
