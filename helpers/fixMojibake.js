const CP1252_FIXES = {
  '\u0080': '\u20AC', // €
  '\u0082': '\u201A', // ‚
  '\u0083': '\u0192', // ƒ
  '\u0084': '\u201E', // „
  '\u0085': '\u2026', // …
  '\u0086': '\u2020', // †
  '\u0087': '\u2021', // ‡
  '\u0088': '\u02C6', // ˆ
  '\u0089': '\u2030', // ‰
  '\u008A': '\u0160', // Š
  '\u008B': '\u2039', // ‹
  '\u008C': '\u0152', // Œ
  '\u008E': '\u017D', // Ž
  '\u0091': '\u2018', // '
  '\u0092': '\u2019', // '
  '\u0093': '\u201C', // "
  '\u0094': '\u201D', // "
  '\u0095': '\u2022', // •
  '\u0096': '\u2013', // – en dash  <-- the common one we hit
  '\u0097': '\u2014', // — em dash
  '\u0098': '\u02DC', // ˜
  '\u0099': '\u2122', // ™
  '\u009A': '\u0161', // š
  '\u009B': '\u203A', // ›
  '\u009C': '\u0153', // œ
  '\u009E': '\u017E', // ž
  '\u009F': '\u0178', // Ÿ
}

const C1_RANGE_REGEX = /[\u0080-\u009F]/g

export function fixMojibake(value) {
  if (typeof value !== 'string' || value.length === 0) return value
  if (!C1_RANGE_REGEX.test(value)) return value // fast path: nothing to fix
  return value.replace(C1_RANGE_REGEX, (ch) => CP1252_FIXES[ch] ?? ch)
}

export function deepFixMojibake(input) {
  if (typeof input === 'string') return fixMojibake(input)
  if (Array.isArray(input)) return input.map(deepFixMojibake)
  if (input && typeof input === 'object') {
    const out = {}
    for (const [key, val] of Object.entries(input)) {
      out[key] = deepFixMojibake(val)
    }
    return out
  }
  return input
}

export function scanForMojibake(input, path = '') {
  const findings = []

  const visit = (val, currentPath) => {
    if (typeof val === 'string') {
      const matches = val.match(C1_RANGE_REGEX)
      if (matches) {
        findings.push({
          path: currentPath,
          codepoints: [...new Set(matches)].map(
            (ch) => '0x' + ch.charCodeAt(0).toString(16).padStart(2, '0')
          ),
          before: val,
          after: fixMojibake(val),
        })
      }
    } else if (Array.isArray(val)) {
      val.forEach((item, i) => visit(item, `${currentPath}[${i}]`))
    } else if (val && typeof val === 'object') {
      for (const [key, v] of Object.entries(val)) {
        visit(v, currentPath ? `${currentPath}.${key}` : key)
      }
    }
  }

  visit(input, path)
  return findings
}