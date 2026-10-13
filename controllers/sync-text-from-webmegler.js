import * as cheerio from 'cheerio'

function fixWin1252(str) {
  if (!str) return String(str ?? '');
  return String(str)
    .replace(/\x80/g, '€').replace(/\x82/g, '‚').replace(/\x83/g, 'ƒ')
    .replace(/\x84/g, '„').replace(/\x85/g, '…').replace(/\x86/g, '†')
    .replace(/\x87/g, '‡').replace(/\x88/g, 'ˆ').replace(/\x89/g, '‰')
    .replace(/\x8A/g, 'Š').replace(/\x8B/g, '‹').replace(/\x8C/g, 'Œ')
    .replace(/\x8E/g, 'Ž').replace(/\x91/g, '\u2018').replace(/\x92/g, '\u2019')
    .replace(/\x93/g, '\u201C').replace(/\x94/g, '\u201D').replace(/\x95/g, '•')
    .replace(/\x96/g, '–').replace(/\x97/g, '—').replace(/\x98/g, '˜')
    .replace(/\x99/g, '™').replace(/\x9A/g, 'š').replace(/\x9B/g, '›')
    .replace(/\x9C/g, 'œ').replace(/\x9E/g, 'ž').replace(/\x9F/g, 'Ÿ');
}

function fixDetailStrings(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  Object.keys(obj).forEach((k) => {
    if (typeof obj[k] === 'string') obj[k] = fixWin1252(obj[k]);
    else if (obj[k] && typeof obj[k] === 'object') fixDetailStrings(obj[k]);
  });
  return obj;
}

function fixBriefData(rawBriefData) {
  if (!Array.isArray(rawBriefData)) return rawBriefData;
  rawBriefData.forEach((item) => {
    if (!item) return;
    if (item.overskrift) item.overskrift = fixWin1252(item.overskrift);
    if (Array.isArray(item.subGroup)) {
      item.subGroup.forEach((sub) => {
        if (!sub) return;
        if (sub.overskrift) sub.overskrift = fixWin1252(sub.overskrift);
        if (sub.html) sub.html = fixWin1252(sub.html);
        if (sub.htmlMedFlettekoder) sub.htmlMedFlettekoder = fixWin1252(sub.htmlMedFlettekoder);
      });
    }
  });
  return rawBriefData;
}

const nbSpace = (n) => Number(n).toLocaleString('no-NO').replace(/,/g, ' ')
const nbPlain = (n) => Number(n).toLocaleString('no-NO')
const area2 = (n) => Number(n).toLocaleString('no-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const FIELD_MAP = {
  'eiendom.kommune': (p) => p?.eiendom?.kommune ?? null,
  'eiendom.adresse': (p) => p?.eiendom?.adresse ?? null,

  prisantydning: (p) => {
    if (p?.prisantydning == null) return null
    let s = 'kr ' + nbSpace(p.prisantydning)
    if (p.prisantydningTil && p.prisantydningTil > 0) s += ' - ' + nbSpace(p.prisantydningTil)
    return s + ',-'
  },

  'okonomi.fellesutgifter': (p) => {
    const u = p?.okonomi?.fellesutgifter
    if (u?.utgifter == null) return null
    let s = 'kr ' + nbSpace(u.utgifter)
    if (u.utgifterTil && u.utgifterTil > 0) s += ' - ' + nbSpace(u.utgifterTil)
    return s + ',-  /Mnd'
  },

  'okonomi.andelFellesgjeld': (p) => {
    const g = p?.okonomi?.andelFellesgjeld
    if (g?.saldo == null) return null
    let s = 'kr ' + nbSpace(g.saldo)
    if (g.saldoTil && g.saldoTil > 0) s += ' - ' + nbSpace(g.saldoTil)
    return s + ',-'
  },

  'okonomi.andelFellesformue': (p) =>
    p?.okonomi?.andelFellesformue != null ? 'kr ' + nbPlain(p.okonomi.andelFellesformue) + ',-' : null,

  'takst.ligningsverdi2': (p) =>
    p?.takst?.ligningsverdi2 != null ? 'kr ' + nbPlain(p.takst.ligningsverdi2) + ',-' : null,

  eiendomstype: (p) => p?.markedsføring?.finnInnstillinger?.eiendomstype ?? null,

  'eiendom.romfordeling.antallSoverom': (p) => {
    const v = p?.eiendom?.romfordeling?.antallSoverom
    if (v == null) return null
    const to = p?.eiendom?.romfordeling?.antallSoveromTil
    return to && to > 0 ? `${v} - ${to}` : String(v)
  },

 'eiendom.etasje': (p) => {
  const etasje = p?.eiendom?.etasje
  const bolignummer = p?.eiendom?.bolignummer
  if ((!etasje || etasje <= 0) && !bolignummer) {
    return null
  }
  let result = ''
  if (etasje && etasje > 0) {
    result += `${etasje}. etasje`
  }
  if (etasje && etasje > 0 && bolignummer) {
    result += ' / '
  }
  if (bolignummer) {
    result += `Bruksenhetsnr. ${bolignummer}`
  }
  return result
},

'okonomi.kommunaleAvgifter.periode': (p) => {
  const periode = p?.okonomi?.kommunaleAvgifter?.periode
  if (!periode) return null
  return String(periode)
},

  'eiendom.byggeår': (p) => (p?.eiendom?.byggeår != null ? String(p.eiendom.byggeår) : null),

  'eiendom.arealer.bruksareal': (p) => {
    const v = p?.eiendom?.arealer?.bruksareal
    if (v == null) return null
    const to = p?.eiendom?.arealer?.bruksarealTil
    return area2(v) + (to && to > 0 ? ' - ' + to : '') + ' m²'
  },

  'eiendom.arealer.interntbruksareal': (p) =>
    p?.eiendom?.arealer?.interntbruksareal != null ? area2(p.eiendom.arealer.interntbruksareal) + ' m²' : null,

  'eierformBygning.navn': (p) => p?.eierformBygning?.navn ?? null,

  'eiendom.arealer.eksterntbruksareal': (p) =>
    p?.eiendom?.arealer?.eksterntbruksareal != null ? area2(p.eiendom.arealer.eksterntbruksareal) + ' m²' : null,

  'okonomi.salgssum': (p) => (p?.okonomi?.salgssum != null ? 'kr ' + nbPlain(p.okonomi.salgssum) + ',-' : null),

  'takst.ligningsverdi': (p) =>
    p?.takst?.ligningsverdi != null ? 'kr ' + nbPlain(p.takst.ligningsverdi) + ',-' : null,

  'eiendom.arealer.tomteareal': (p) => {
    const v = p?.eiendom?.arealer?.tomteareal
    if (v == null) return null
    const eierform = p?.markedsføring?.finnInnstillinger?.eierformTomt || ''
    return /* (eierform ? eierform + " " : "") +  */ area2(v) + ' m²'
  },

  'eiendom.arealer.primærrom': (p) => {
    const v = p?.eiendom?.arealer?.primærrom
    if (v == null) return null
    const to = p?.eiendom?.arealer?.primærromTil
    return area2(v) + (to && to > 0 ? ' - ' + to : '') + ' m²'
  },

  'eiendom.arealer.aapentareal': (p) =>
    p?.eiendom?.arealer?.aapentareal != null ? area2(p.eiendom.arealer.aapentareal) + ' m²' : null,

  'megler1.navn': (p) => p?.megler1?.navn ?? null,
  'megler1.email': (p) => p?.megler1?.email ?? null,
  'megler1.profilbilde': (p) => p?.megler1?.profilbilde ?? null,
  'megler.role': (p) => "Eiendomsmegler" ?? null,
  'megler1.mobiltelefon': (p) => (p?.megler1?.mobiltelefon != null ? '+47' + p.megler1.mobiltelefon : null),
  'megler2.navn': (p) => p?.megler2?.navn ?? null,
  'megler2.email': (p) => p?.megler2?.email ?? null,
  'megler2.profilbilde': (p) => p?.megler2?.profilbilde ?? null,
  'megler2.mobiltelefon': (p) => (p?.megler2?.mobiltelefon != null ? '+47' + p.megler2.mobiltelefon : null),
}

const syncTextFromWebmegler = (savedHtml, propertyDetail) => {
  const $ = cheerio.load(savedHtml, { decodeEntities: false })

  const changed = []
  const skipped = []

  $('[data-field]').each((_, el) => {
    const $el = $(el)
    const key = $el.attr('data-field')
    // if ($el.attr("data-locked") != null) { skipped.push({ key, reason: "locked" }); return; }
    const fmt = FIELD_MAP[key]

    if (!fmt) {
      skipped.push({ key, reason: 'not-in-field-map' })
      return
    }
    const newText = fmt(propertyDetail)
    if (newText == null) {
      skipped.push({ key, reason: 'no-value' })
      return
    }

    if ($el.is('img')) {
      const oldSrc = $el.attr('src') || ''
      if (oldSrc === String(newText)) return
      $el.attr('src', String(newText))
      changed.push({ key, from: oldSrc, to: String(newText) })
      return
    }

    const oldText = $el.text().trim()
    if (oldText === String(newText).trim()) return
    $el.text(String(newText))
    changed.push({ key, from: oldText, to: String(newText) })
  })

  return { html: $.html(), changed, skipped }
}

const LINE_RATIO    = 1.4;   // == FLOW_BLOCK_LINE_HEIGHT in the editor
const BLOCK_MARGIN  = 2;     // == FLOW_BLOCK_MARGIN in the editor
const BODY_FS       = 16;    // px body font-size
const LINE_H        = BODY_FS * LINE_RATIO;   // 22.4 px per body line
const H1_FS = 34, H1_LH = H1_FS * LINE_RATIO; // 47.6 — h1.megler-name
const H2_FS = 24, H2_LH = H2_FS * LINE_RATIO; // 33.6 — h2 (rare)
const H3_FS = 18, H3_LH = H3_FS * LINE_RATIO; // 25.2 — h3 overskrift
const H3_MT = 20;            // h3 { margin-top: 20px !important }
const COL_GAP       = 32;    // .cols-2 column-gap
const LI_INDENT     = 24;    // ul/ol indent

const isEmptyHTML = (s) =>
  !s ||
  s === '<div></div>' ||
  s === '<div><br /></div>' ||
  s === '<div><br />\r\n</div>' ||
  s.toLowerCase() === 'no data'

const escapeHTML = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const isFloorplanImage = (image) =>
  !!(image && image.beskrivelse && image.beskrivelse.toLowerCase().includes('plantegning'))

const sortImagesForLayout = (images) => {
  if (!Array.isArray(images)) return []
  const regular = []
  const floorplan = []
  images.forEach((image) => (isFloorplanImage(image) ? floorplan : regular).push(image))
  return [...regular, ...floorplan]
}

const GLYPH_W = (function() {
  const w = {};
  const put = function(chars, width) { for (const ch of chars) w[ch] = width; };
  put(" ", 278); put(" ", 278);
  put("!", 278); put("\"", 355); put("#", 556); put("$", 556); put("%", 889);
  put("&", 667); put("'", 191); put("(", 333); put(")", 333); put("*", 389);
  put("+", 584); put(",", 278); put("-", 333); put(".", 278); put("/", 278);
  put("0123456789", 556);
  put(":", 278); put(";", 278); put("<", 584); put("=", 584); put(">", 584);
  put("?", 556); put("@", 1015);
  put("A", 667); put("B", 667); put("C", 722); put("D", 722); put("E", 667);
  put("F", 611); put("G", 778); put("H", 722); put("I", 278); put("J", 500);
  put("K", 667); put("L", 556); put("M", 833); put("N", 722); put("O", 778);
  put("P", 667); put("Q", 778); put("R", 722); put("S", 667); put("T", 611);
  put("U", 722); put("V", 667); put("W", 944); put("X", 667); put("Y", 667);
  put("Z", 611);
  put("[", 278); put("\\", 278); put("]", 278); put("^", 469); put("_", 556);
  put("`", 333);
  put("a", 556); put("b", 556); put("c", 500); put("d", 556); put("e", 556);
  put("f", 278); put("g", 556); put("h", 556); put("i", 222); put("j", 222);
  put("k", 500); put("l", 222); put("m", 833); put("n", 556); put("o", 556);
  put("p", 556); put("q", 556); put("r", 333); put("s", 500); put("t", 278);
  put("u", 556); put("v", 500); put("w", 722); put("x", 500); put("y", 500);
  put("z", 500);
  put("{", 334); put("|", 260); put("}", 334); put("~", 584);
  put("æ", 889); put("Æ", 1000); put("ø", 611); put("Ø", 778);
  put("åäàáâã", 556); put("ÅÄÀÁÂÃ", 667);
  put("éèêë", 556); put("ÉÈÊË", 667);
  put("íìîï", 278); put("ÍÌÎÏ", 278);
  put("óòôõö", 556); put("ÓÒÔÕÖ", 778);
  put("úùûü", 556); put("ÚÙÛÜ", 722);
  put("ç", 500); put("Ç", 722); put("ñ", 556); put("Ñ", 722); put("ß", 611);
  put("°", 400); put("«»", 556); put("–", 556); put("—", 1000);
  put("‘’‚", 222); put("“”„", 333); put("…", 1000); put("•", 350);
  put("²³¹", 333); put("½¼¾", 834); put("©®", 737); put("§", 556);
  return w;
})();

const GLYPH_W_BOLD = (function() {
  const w = {};
  const put = function(chars, width) { for (const ch of chars) w[ch] = width; };
  put(" ", 278); put(" ", 278);
  put("!", 333); put("\"", 474); put("#", 556); put("$", 556); put("%", 889);
  put("&", 722); put("'", 238); put("(", 333); put(")", 333); put("*", 389);
  put("+", 584); put(",", 278); put("-", 333); put(".", 278); put("/", 278);
  put("0123456789", 556);
  put(":", 333); put(";", 333); put("<", 584); put("=", 584); put(">", 584);
  put("?", 611); put("@", 975);
  put("A", 722); put("B", 722); put("C", 722); put("D", 722); put("E", 667);
  put("F", 611); put("G", 778); put("H", 722); put("I", 278); put("J", 556);
  put("K", 722); put("L", 611); put("M", 833); put("N", 722); put("O", 778);
  put("P", 667); put("Q", 778); put("R", 722); put("S", 667); put("T", 611);
  put("U", 722); put("V", 667); put("W", 944); put("X", 667); put("Y", 667);
  put("Z", 611);
  put("[", 333); put("\\", 278); put("]", 333); put("^", 584); put("_", 556);
  put("`", 333);
  put("a", 556); put("b", 611); put("c", 556); put("d", 611); put("e", 556);
  put("f", 333); put("g", 611); put("h", 611); put("i", 278); put("j", 278);
  put("k", 556); put("l", 278); put("m", 889); put("n", 611); put("o", 611);
  put("p", 611); put("q", 611); put("r", 389); put("s", 556); put("t", 333);
  put("u", 611); put("v", 556); put("w", 778); put("x", 556); put("y", 556);
  put("z", 500);
  put("{", 389); put("|", 280); put("}", 389); put("~", 584);
  put("æ", 889); put("Æ", 1000); put("ø", 611); put("Ø", 778);
  put("åäàáâã", 556); put("ÅÄÀÁÂÃ", 722);
  put("éèêë", 556); put("ÉÈÊË", 667);
  put("íìîï", 278); put("ÍÌÎÏ", 278);
  put("óòôõö", 611); put("ÓÒÔÕÖ", 778);
  put("úùûü", 611); put("ÚÙÛÜ", 722);
  put("ç", 556); put("Ç", 722); put("ñ", 611); put("Ñ", 722); put("ß", 611);
  put("°", 400); put("«»", 556); put("–", 556); put("—", 1000);
  put("‘’‚", 278); put("“”„", 500); put("…", 1000); put("•", 350);
  put("²³¹", 333); put("½¼¾", 834); put("©®", 737); put("§", 556);
  return w;
})();
const DEFAULT_GLYPH_W = 556;

function glyphW(ch, bold) {
  const w = (bold ? GLYPH_W_BOLD : GLYPH_W)[ch];
  return w === undefined ? DEFAULT_GLYPH_W : w;
}
function textW(s, fs, bold) {
  let t = 0;
  for (const ch of s) t += glyphW(ch, bold);
  return (t * fs) / 1000;
}

function decodeEnt(s) {
  return String(s)
    .replace(/&#(\d+);/g, function(_, d) {
      const n = Number(d);
      return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : " ";
    })
    .replace(/&#x([0-9a-f]+);/gi, function(_, h) {
      const n = parseInt(h, 16);
      return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : " ";
    })
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"').replace(/&apos;/gi, "'")
    .replace(/&aring;/gi, "å").replace(/&oslash;/gi, "ø").replace(/&aelig;/gi, "æ")
    .replace(/&Aring;/g, "Å").replace(/&Oslash;/g, "Ø").replace(/&AElig;/g, "Æ")
    .replace(/&laquo;/gi, "«").replace(/&raquo;/gi, "»")
    .replace(/&ndash;/gi, "–").replace(/&mdash;/gi, "—")
    .replace(/&deg;/gi, "°").replace(/&sup2;/gi, "²").replace(/&sup3;/gi, "³")
    .replace(/&hellip;/gi, "…").replace(/&bull;/gi, "•");
}

function wrapWords(words, colW, fs, maxLines, bold) {
  if (!words.length) return { lines: 0, cut: 0 };
  const spaceW = textW(" ", fs, bold);
  let lines = 1, x = 0, cut = 0;
  for (let i = 0; i < words.length; i++) {
    const ww = textW(decodeEnt(words[i]), fs, bold);
    if (ww > colW) {
      if (x > 0) { lines++; x = 0; }
      const parts = Math.ceil(ww / colW);
      lines += parts - 1;
      x = ww - (parts - 1) * colW;
    } else {
      const add = x === 0 ? ww : spaceW + ww;
      if (x + add > colW) { lines++; x = ww; } else { x += add; }
    }
    if (lines > maxLines) return { lines: lines, cut: cut };
    cut = i + 1;
  }
  return { lines: lines, cut: cut };
}

function wrapLines(text, colW, fs, bold) {
  const words = decodeEnt(text).replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  return wrapWords(words, colW, fs, Infinity, bold).lines;
}

function countBodyLines(html, colW) {
  const BR = "\u0001", BLOCK = "\u0002";
  const marked = String(html)
    .replace(/<br\s*\/?>/gi, BR)
    .replace(/<\/(p|div|li|tr|ul|ol|table|h[1-6])\s*>/gi, BLOCK)
    .replace(/<[^>]+>/g, "");
  const bold = /<(b|strong)\b/i.test(html);
  let lines = 0, buf = "";
  const flush = function(fromBr) {
    const t = decodeEnt(buf).replace(/\s+/g, " ").trim();
    if (t) lines += wrapLines(t, colW, BODY_FS, bold);
    else if (fromBr) lines += 1;
    buf = "";
  };
  for (const ch of marked) {
    if (ch === BR) flush(true);
    else if (ch === BLOCK) flush(false);
    else buf += ch;
  }
  flush(false);
  return Math.max(1, lines);
}

function atomBox(html, colW) {
  colW = colW || ACC_COL_W;
  if (!html) return { h: 0, mt: 0, mb: 0 };
  const head = String(html).match(/^\s*<h([1-6])\b/i);
  if (head) {
    const lvl = Number(head[1]);
    const fs = lvl === 1 ? H1_FS : lvl === 2 ? H2_FS : H3_FS;
    const lh = lvl === 1 ? H1_LH : lvl === 2 ? H2_LH : H3_LH;
    const text = String(html).replace(/<[^>]+>/g, " ");
    const lines = Math.max(1, wrapLines(text, colW, fs, true));
    return {
      h: lines * lh,
      mt: lvl >= 3 ? H3_MT : BLOCK_MARGIN,
      mb: BLOCK_MARGIN,
    };
  }
  const isList = /<li\b/i.test(html);
  return {
    h: countBodyLines(html, isList ? colW - LI_INDENT : colW) * LINE_H,
    mt: BLOCK_MARGIN,
    mb: BLOCK_MARGIN,
  };
}

function estimateHeight(html, colW) {
  const b = atomBox(html, colW);
  return b.h + b.mt;
}

function unwrapDiv(html) {
  if (!html) return ''
  const s = html.trim()
  const m = s.match(/^<div[^>]*>([\s\S]*)<\/div>$/i)
  if (!m) return s
  const inner = m[1]
  const opens = (inner.match(/<div\b/gi) || []).length
  const closes = (inner.match(/<\/div>/gi) || []).length
  return opens === closes ? inner.trim() : s
}

function findBalancedDivEnd(s, start) {
  const openMatch = s.slice(start).match(/^<div\b[^>]*>/i)
  if (!openMatch) return -1
  let pos = start + openMatch[0].length,
    depth = 1
  while (depth > 0 && pos < s.length) {
    const tail = s.slice(pos)
    const closeIdx = tail.search(/<\/div>/i)
    const openIdx = tail.search(/<div\b/i)
    if (closeIdx === -1) return -1
    if (openIdx !== -1 && openIdx < closeIdx) {
      const nestedOpen = tail.slice(openIdx).match(/^<div\b[^>]*>/i)
      if (!nestedOpen) {
        pos += openIdx + 4
        continue
      }
      depth++
      pos += openIdx + nestedOpen[0].length
    } else {
      depth--
      pos += closeIdx + 6
    }
  }
  return depth === 0 ? pos : -1
}

function htmlToAtoms(html) {
  if (!html) return []
  const src = unwrapDiv(html)
  const out = []
  let buf = ''
  const flush = () => {
    const t = buf.trim()
    if (t) out.push(t)
    buf = ''
  }
  let i = 0
  while (i < src.length) {
    const tail = src.slice(i)
    const list = tail.match(/^<(ul|ol)([^>]*)>([\s\S]*?)<\/\1>/i)
    if (list) {
      flush()
      const tag = list[1],
        attrs = list[2],
        inner = list[3]
      const liRe = /<li([^>]*)>([\s\S]*?)<\/li>/gi
      let m,
        any = false
      while ((m = liRe.exec(inner)) !== null) {
        out.push('<' + tag + attrs + '><li' + m[1] + '>' + m[2] + '</li></' + tag + '>')
        any = true
      }
      if (!any) out.push(list[0])
      i += list[0].length
      continue
    }
    const table = tail.match(/^<table([^>]*)>([\s\S]*?)<\/table>/i)
    if (table) {
      flush()
      const attrs = table[1],
        inner = table[2]
      const trRe = /<tr([^>]*)>([\s\S]*?)<\/tr>/gi
      let m,
        any = false
      while ((m = trRe.exec(inner)) !== null) {
        out.push('<table' + attrs + '><tbody><tr' + m[1] + '>' + m[2] + '</tr></tbody></table>')
        any = true
      }
      if (!any) out.push(table[0])
      i += table[0].length
      continue
    }
    if (/^<div\b/i.test(tail)) {
      const openMatch = tail.match(/^<div\b[^>]*>/i)
      const end = findBalancedDivEnd(src, i)
      if (openMatch && end > i) {
        flush()
        const inner = src.slice(i + openMatch[0].length, end - 6)
        htmlToAtoms(inner).forEach((a) => out.push(a))
        i = end
        continue
      }
      if (openMatch) {
        i += openMatch[0].length
        continue
      }
    }
    const block = tail.match(/^<(p|h[1-6])([^>]*)>([\s\S]*?)<\/\1>/i)
    if (block) {
      flush()
      out.push(block[0])
      i += block[0].length
      continue
    }
    const br = tail.match(/^<br\s*\/?>/i)
    if (br) {
      flush()
      i += br[0].length
      continue
    }
    const strayClose = tail.match(/^<\/div>/i)
    if (strayClose) {
      i += strayClose[0].length
      continue
    }
    buf += src[i]
    i++
  }
  flush()
  return out.map((a) => (/^<(p|h[1-6]|ul|ol|li|table|tr|div|span)\b/i.test(a) ? a : '<p>' + a + '</p>'))
}

const MIN_SPLIT_LINES = 1;

const isHeadingAtom = function(a) { return /^\s*<h[1-6]\b/i.test(a.html); };

function splitAtomToFit(atom, roomPx, colW) {
  const maxLines = Math.floor(roomPx / LINE_H);
  if (maxLines < MIN_SPLIT_LINES) return null;
  const m = String(atom.html).match(/^\s*<(p|div)\b([^>]*)>([\s\S]*)<\/\1>\s*$/i);
  if (!m) return null;
  const tag = m[1], attrs = m[2], inner = m[3];
  if (/<[a-z!\/]/i.test(inner)) return null;  
  const words = inner.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  if (words.length < 2) return null;
  const fit = wrapWords(words, colW, BODY_FS, maxLines);
  if (fit.lines <= maxLines) return null;
  const cut = fit.cut;
  if (cut < 1 || cut > words.length - 1) return null;
  const mk = function(text) {
    const html = "<" + tag + attrs + ">" + text + "</" + tag + ">";
    const box = atomBox(html, colW);
    return { html: html, h: box.h + box.mt, box: box };
  };
  const head = mk(words.slice(0, cut).join(" "));
  const tail = mk(words.slice(cut).join(" "));
  if (head.box.h > roomPx) return null;
  if (!tail.box.h || tail.box.h < MIN_SPLIT_LINES * LINE_H) return null;
  return { head: head, tail: tail };
}

function fillColumn(queue, capH, colW) {
  const col = [];
  let used = 0, prevMb = 0;
  while (queue.length) {
    const a = queue[0];
    const box = a.box || atomBox(a.html, colW);
    const gap = col.length === 0 ? box.mt : Math.max(prevMb, box.mt);
    if (used + gap + box.h <= capH) {
      col.push(queue.shift());
      used += gap + box.h;
      prevMb = box.mb;
      continue;
    }
    const split = splitAtomToFit(a, capH - used - gap, colW);
    if (split) {
      queue.shift();
      col.push(split.head);
      queue.unshift(split.tail);
    }
    break;
  }
  while (col.length > 1 && isHeadingAtom(col[col.length - 1])) {
    queue.unshift(col.pop());
  }
  if (col.length === 0 && queue.length) col.push(queue.shift());
  return col;
}

function packColumns(atoms, colH, colW, colCount, colHFirst) {
  const n = colCount || 1;
  const queue = atoms.slice();
  const pages = [];
  let guard = 0;
  while (queue.length && guard++ < 100000) {
    const cap = pages.length === 0 && colHFirst ? colHFirst : colH;
    let page = [];
    for (let c = 0; c < n && queue.length; c++) {
      page = page.concat(fillColumn(queue, cap, colW));
    }
    if (!page.length) break;
    pages.push(page);
  }
  return pages;
}

function paginateAtoms(atoms, opts) {
  if (atoms.length === 0) return [];
  const o = opts || {};
  return packColumns(atoms, o.colH || COLS_H, o.colW || ACC_COL_W, o.colCount || 2, o.colHFirst);
}

function paginate(html, opts) {
  if (!html || isEmptyHTML(html)) return [];
  const colW = (opts && opts.colW) || ACC_COL_W;
  const atoms = htmlToAtoms(html).map(function(a) {
    return { html: a, h: estimateHeight(a, colW), box: atomBox(a, colW) };
  });
  return paginateAtoms(atoms, opts);
}

function paginateOmSingle(html, capFirst, capRest) {
  if (!html || isEmptyHTML(html)) return [];
  const atoms = htmlToAtoms(html).map(function(a) {
    return { html: a, h: estimateHeight(a, OM_COL_W), box: atomBox(a, OM_COL_W) };
  });
  return packColumns(atoms, capRest, OM_COL_W, 1, capFirst);
}

function paginateAccordion(briefDetail) {
  if (!briefDetail || !briefDetail.length) return []
  const atoms = []
  briefDetail
    .filter((item) => !item?.group?.overskrift?.startsWith('Finn.no'))
    .forEach((entry) => {
      if (!entry || !entry.subGroup) return
      const renderable = []
      entry.subGroup.forEach((sub) => {
        const html = sub?.html ? sub.html.trim() : ''
        const flette = sub?.htmlMedFlettekoder ? sub.htmlMedFlettekoder.trim() : ''
        const tittel = sub?.overskrift ? sub.overskrift.trim() : ''
        if (flette && !isEmptyHTML(flette) && !isEmptyHTML(html)) renderable.push({ overskrift: tittel, html })
      })
      if (renderable.length === 0) return
      const groupTitle = entry.group ? entry.group.overskrift : ''
      if (groupTitle) {
        const h1 = '<h1 class="megler-name">' + escapeHTML(groupTitle) + '</h1>'
        atoms.push({ html: h1, h: estimateHeight(h1, ACC_COL_W), box: atomBox(h1, ACC_COL_W) })
      }
      renderable.forEach((sub) => {
        if (sub.overskrift) {
          const h3 = '<h3>' + escapeHTML(sub.overskrift) + '</h3>'
          atoms.push({ html: h3, h: estimateHeight(h3, ACC_COL_W), box: atomBox(h3, ACC_COL_W) })
        }
        htmlToAtoms(sub.html).forEach((a) =>
          atoms.push({ html: a, h: estimateHeight(a, ACC_COL_W), box: atomBox(a, ACC_COL_W) }))
      })
    })
  return paginateAtoms(atoms)
}

function buildBriefGroups(rawData) {
  const out = []
  let cur = null
  for (const item of rawData || []) {
    if (item?.erHovedOverskrift) {
      cur = { group: item, subGroup: [] }
      out.push(cur)
    } else if (cur) cur.subGroup.push(item)
  }
  return out
}

function getBeskrivelse(briefDetail) {
  const sub = briefDetail?.[0]?.subGroup
  const item = sub?.find((it) => it.overskrift === 'Beskrivelse')
  return item?.html || ''
}

const PAGE_W = 794,
  PAGE_H = 1123

const COLS_H = Math.floor(Math.floor((PAGE_H - 90 - 40) / LINE_H) * LINE_H) // 985
const COLS_H_P0 = COLS_H - 8 * Math.round(LINE_H)                          // 806
const ACC_BOX_W = PAGE_W - 80                                              // 714
const ACC_COL_W = Math.floor((ACC_BOX_W - COL_GAP) / 2)                    // 341
const OM_COL_W = PAGE_W - Math.round(PAGE_W * 0.4) - 72                    // 404
let _seq = 0
const elId = () => `sync-${Date.now().toString(36)}-${_seq++}`

const editorPage = (id, bg, inner, dataField) =>
  `<div id="${id}" class="page" data-page="${id}" data-page-bg="${bg}"` +
  (dataField ? ` data-field="${dataField}"` : '') + ` ` +
  `style="position:relative;width:${PAGE_W}px;height:${PAGE_H}px;background:${bg};` +
  `overflow:hidden;page-break-after:always;break-after:page;">${inner}</div>`

const CANON_ORDER = [
  'cover', 'blank', 'velkommen', 'firstimg', 'nokkel', 'megler',
  'om', 'gallery', 'accordion', 'doc', 'end',
]
const canonRank = (key) => {
  const i = CANON_ORDER.indexOf(key)
  return i === -1 ? Infinity : i
}

const SECTION_MARKERS = {
  nokkel: 'nokkel',
  megler: 'megler',
  'om-cover': 'om',
  'om-page': 'om',
  'accordion-cover': 'accordion',
  'accordion-page': 'accordion',
  'document-cover': 'doc',
  'document-page': 'doc',
  'floorplan-cover': 'gallery',
  'extra-page': 'end',
}

const classifyPage = ($, el) => {
  const $el = $(el)
  const id = $el.attr('id') || $el.attr('data-page') || ''
  const marker = $el.attr('data-field') || ''

  if (SECTION_MARKERS[marker]) return SECTION_MARKERS[marker]

  if (id === 'page_0') return 'cover'
  if (id === 'page_1') return 'blank'
  if (id === 'page_2') return 'velkommen'
  if (/^page_img0[ab]$/.test(id)) return 'firstimg'
  if (/^page_img\d+[ab]$/.test(id)) return 'gallery'
  if (id === 'page_floorplan_title') return 'gallery'
  if (/^page_floorplan_\d+$/.test(id)) return 'gallery'
  if (id === 'page_48') return 'nokkel'
  if (id === 'page_91') return 'megler'
  if (id === 'page_49' || /^page_49_\d+$/.test(id)) return 'om'
  if (/^page_90(_\d+)?$/.test(id)) return 'om'
  if (id === 'page_92') return 'accordion'
  if (/^page_93(_\d+)?$/.test(id)) return 'accordion'
  const nMatch = /^page_(\d+)$/.exec(id)
  if (nMatch) {
    const n = Number(nMatch[1])
    if (n === 400 || (n >= 401 && n <= 999)) return 'doc'
    if (n === 1000 || n === 1001 || n === 1002 || n === 200 || n === 201 || n === 250) return 'end'
  }

  if ($el.find('[data-field="accordion"]').length > 0) return 'accordion'
  const txt = $el.text()
  if (/OM EIENDOMMEN/i.test(txt) && $el.find('[data-field="om-beskrivelse"]').length === 0) return 'accordion'

  return 'custom:' + (id || 'unknown')
}

const blockReset = `line-height:${LINE_RATIO};margin-block:${BLOCK_MARGIN}px`

const stampAtom = (html) =>
  String(html).replace(/^(\s*<[a-z][a-z0-9]*)((?:\s[^>]*)?)>/i, (_, open, attrs) => {
    const a = attrs || ''
    return /\sstyle\s*=\s*"/i.test(a)
      ? open + a.replace(/\sstyle\s*=\s*"/i, ` style="${blockReset};`) + '>'
      : open + a + ` style="${blockReset}">`
  })

const stampAtoms = (atoms) => (atoms || []).map((a) => stampAtom(a.html)).join('')

const richBox = (dataField, top, atomsHtml, opts = {}) => {
  const left = opts.left != null ? opts.left : 40
  const width = opts.width != null ? opts.width : ACC_BOX_W

  const height = opts.height != null ? opts.height : COLS_H
  const colCss = opts.cols === 1 ? 'column-count:1;-webkit-column-count:1;' : ''
  return `<div ${dataField ? ` data-field="${dataField}"` : ''} ` +
    `data-richtext="true" class="cols-2" ` +
    `style="position:absolute;left:${left}px;top:${top}px;width:${width}px;` +
    `height:${height}px;${colCss}column-fill:auto;-webkit-column-fill:auto;">${atomsHtml}</div>`
}
const omPill = () => `<div class="om-pill om-pill-right">OM EIENDOMMEN</div>`
const pill = (n) => '<div class="om-pill ' + (n % 2 === 0 ? 'om-pill-left' : 'om-pill-right') + '">OM EIENDOMMEN</div>'

const pageNumBadge = (n = 1, color = "#e2cf9e") =>
  '<div class="page-num-bar">' +
  '<img class="page-num-line" data-locked="true" src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\'/%3E" alt="" />' +
  `<div class="page-num" data-field="page-num" style="background-color: ${color};">${n}</div>` +
  '</div>'

const NOKKEL_FIELDS = [
  { label: 'Prisantydning', field: 'prisantydning' },
  { label: 'Felleskostnader', field: 'okonomi.fellesutgifter' },
  { label: 'Andel gjeld', field: 'okonomi.andelFellesgjeld' },
  { label: 'Andel formune', field: 'okonomi.andelFellesformue' },
  { label: 'Formuesverdi (sekundaerbolig)', field: 'takst.ligningsverdi2' },
  { label: 'Eiendomstype', field: 'eiendomstype' },
  { label: 'Soverom', field: 'eiendom.romfordeling.antallSoverom' },
  { label: 'Leilighet', field: 'eiendom.etasje' },
  { label: 'Byggeår', field: 'eiendom.byggeår' },
  { label: 'Bruksareal', field: 'eiendom.arealer.bruksareal' },
  { label: 'Kommunale avgifter', field: 'avgifter', value: (p) => (p?.okonomi?.kommunaleAvgifter?.avgifter != null ? `${p.okonomi.kommunaleAvgifter.avgifter}` : null) },
  { label: 'Periode', field: 'okonomi.kommunaleAvgifter.periode' },
  { label: 'BRA-i', field: 'eiendom.arealer.interntbruksareal' },
  { label: 'Eierform', field: 'eierformBygning.navn' },
  { label: 'BRA-e', field: 'eiendom.arealer.eksterntbruksareal' },
  { label: 'Salgssum', field: 'okonomi.salgssum' },
  { label: 'Formuesverdi', field: 'takst.ligningsverdi' },
  { label: 'Tomt', field: 'eiendom.arealer.tomteareal' },
  { label: 'Primærrom', field: 'eiendom.arealer.primærrom' },
  { label: 'TBA', field: 'eiendom.arealer.aapentareal' },
]

const energiColor = (s = '') =>
  s.includes('Rød') ? '#C32632'
    : s.includes('Oransje') ? '#F47821'
      : s.includes('Grønn') ? '#279248'
        : s.includes('IkkeSatt') ? '#4CAF50'
          : '#CAA950'

const isBlankOrZero = (val) => {
  if (val == null) return true
  const cleaned = String(val)
    .replace(/kr|m²|\/mnd|,-/gi, '') // currency / unit / suffix tokens
    .replace(/[\s.,\-/]/g, '') // separators
    .trim()
  return cleaned === '' || /^0+$/.test(cleaned)
}

function renderNokkel(propertyDetail) {
  const cells = []
  NOKKEL_FIELDS.forEach((f) => {
    const val = f.value ? f.value(propertyDetail) : (FIELD_MAP[f.field] ? FIELD_MAP[f.field](propertyDetail) : null)
    if (isBlankOrZero(val)) return
    cells.push({ label: f.label, field: f.field, value: String(val).trim(), svg: '' })
  })
  const energi = propertyDetail?.eiendom?.energimerking
  if (energi) {
    cells.push({
      label: 'Energimerke',
      field: 'eiendom.energimerking',
      value: '',
      svg:
        '<svg width="40" height="40" viewBox="0 0 32 32" style="display:block">' +
        `<polygon points="16,4 29,12 24,28 8,28 3,12" fill="${energiColor(String(energi))}" />` +
        `<text x="16" y="18" text-anchor="middle" font-size="12" fill="#ffffff" font-weight="bold" dominant-baseline="middle">${escapeHTML(String(energi).slice(-1))}</text>` +
        '</svg>',
    })
  }
  if (!cells.length) return ''

  const left = 48
  const contentW = PAGE_W - left * 2
  const gapX = 16
  const cellW = Math.floor((contentW - gapX * 2) / 3)
  const colX = (c) => left + c * (cellW + gapX)
  const gridTop = 240
  const rowH = 104

  let inner =
    pageNumBadge() +
    `<div  style="position:absolute;left:${left}px;top:44px;width:${contentW}px;font-size:14px;letter-spacing:0.24px;color:#000;">NØKKELOPPLYSNINGER</div>` +
    `<div  style="position:absolute;left:${left}px;top:138px;width:${contentW}px;text-align:center;font-size:53px;color:#000;">Nøkkelopplysninger</div>`

  cells.forEach((cell, i) => {
    const x = colX(i % 3)
    const y = gridTop + Math.floor(i / 3) * rowH
    inner += `<div  style="position:absolute;left:${x}px;top:${y}px;width:${cellW}px;font-size:15px;color:#333;line-height:1.2;">${escapeHTML(cell.label)}</div>`
    inner += cell.svg
      ? `<div  style="position:absolute;left:${x}px;top:${y + 30}px;width:${cellW}px;">${cell.svg}</div>`
      : `<div  data-field="${cell.field}" style="position:absolute;left:${x}px;top:${y + 30}px;width:${cellW}px;font-size:17px;color:#06456d;line-height:1.2;">${escapeHTML(cell.value)}</div>`
  })

  return editorPage('page_48', '#e2cf9e', inner, 'nokkel')
}

const OM_IMG_FRAC = 0.7
const OM_IMG_W = Math.round(PAGE_W * OM_IMG_FRAC) // 556
const OM_TXT_W = PAGE_W - OM_IMG_W // 238
const OM_TXT_PADX = 20
const OM_TXT_PADTOP = 80
const OM_TXT_PADBOT = 40
const OM_TXT_CW = OM_TXT_W - OM_TXT_PADX * 2 // 198
const OM_HEAD_BAND = 120
const OM_SAFE = 0.92
const OM_BAND_H = Math.round(PAGE_H * 0.42) // 472

function omColHeight(html, cpl, lineH) {
  if (!html) return 0
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;|&#xA0;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const lines = Math.max(1, Math.ceil(text.length / cpl))
  const li = (html.match(/<li\b/gi) || []).length
  return lines * lineH + li * 4
}

function packOmPages(atoms, capFirst, capRest) {
  const pages = []
  let cur = [],
    curH = 0,
    cap = capFirst
  atoms.forEach((a) => {
    if (cur.length > 0 && curH + a.h > cap) {
      pages.push(cur)
      cur = []
      curH = 0
      cap = capRest
    }
    cur.push(a)
    curH += a.h
  })
  if (cur.length) pages.push(cur)
  for (let i = 0; i < pages.length - 1; i++) {
    while (pages[i].length > 1 && /^<h[1-6]\b/i.test(pages[i][pages[i].length - 1].html)) {
      pages[i + 1].unshift(pages[i].pop())
    }
  }
  return pages
}


function omStampFont(html, px) {
  return html.replace(/^<([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>/, (_, tag, attrs, selfClose) => {
    const m = attrs.match(/\sstyle\s*=\s*"([^"]*)"/i)
    if (m) return '<' + tag + attrs.replace(m[0], ` style="font-size:${px}px;${m[1]}"`) + selfClose + '>'
    return '<' + tag + attrs + ` style="font-size:${px}px"` + selfClose + '>'
  })
}

const omBox = (top, left, width, height, cols, atomsHtml) =>
  `<div data-field="om-beskrivelse" data-richtext="true" class="cols-2" ` +
  `style="position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${height}px;` +
  `overflow:hidden;column-count:${cols};-webkit-column-count:${cols};">${atomsHtml}</div>`

const OM_TEXT_TOP_PADDING = 140 // flex container padding-top (all pages) — matches property-template.ejs
const OM_BOTTOM_PADDING = 48    // flex container padding-bottom
const OM_HEADING_HEIGHT = 102   // space reserved for "Om Eiendommen" + overskrift heading block on page 0
const OM_CONTENT_HEIGHT = PAGE_H - OM_TEXT_TOP_PADDING - OM_BOTTOM_PADDING // 935 — pages 1+
const OM_FIRST_HEIGHT = OM_CONTENT_HEIGHT - OM_HEADING_HEIGHT             // 833 — page 0 (top-anchored, not centered)

function renderOm(briefDetail, propertyDetail, propertyImages) {
  const sortedImages = sortImagesForLayout(propertyImages)
  const omHasImg = sortedImages.length > 0

  const pages = omHasImg
    ? paginateOmSingle(getBeskrivelse(briefDetail), OM_FIRST_HEIGHT, OM_CONTENT_HEIGHT)

    : paginate(getBeskrivelse(briefDetail), { colHFirst: COLS_H_P0 })
  if (!pages.length) return ''
  const adresse = escapeHTML(propertyDetail?.eiendom?.adresse ?? '')
  const overskrift = escapeHTML(propertyDetail?.overskrift ?? '')

  const spreadW = PAGE_W * 2
  const p90ImgW = Math.round(PAGE_W * 0.40)
  const p90TxtW = PAGE_W - p90ImgW
  const padX = 36

  const omUrlsFor = (idx) => {
    const image = sortedImages[(idx + 1) % sortedImages.length]
    const base = `https://images.weserv.nl/?url=${encodeURIComponent(image.url)}&w=${spreadW}&h=${PAGE_H}&fit=cover`
    return {
      p49: `${base}&cx=0&cy=0&cw=${PAGE_W}&ch=${PAGE_H}`,
      p90: `${base}&cx=${PAGE_W}&cy=0&cw=${p90ImgW}&ch=${PAGE_H}`,
      alt: escAttr(image.beskrivelse ?? ''),
      caption: escapeHTML((image.beskrivelse ?? '').toString().trim()),
    }
  }

  const suffix = (idx) => (idx === 0 ? '' : '_' + idx)

  let html = ''

  if (!omHasImg) {
    html += editorPage(
      'page_49',
      '#18344e',
      pageNumBadge() +
        `<div  data-field="eiendom.adresse" style="position:absolute;left:0;top:383px;width:${PAGE_W}px;text-align:center;color:#e2cf9e;font-size:13px;letter-spacing:1.1px;">${adresse}</div>` +
        `<div  style="position:absolute;left:0;top:408px;width:${PAGE_W}px;text-align:center;color:#e2cf9e;font-size:30px;">OM EIENDOMMEN</div>`,
      'om-cover'
    )
    pages.forEach((page, idx) => {
      const atomsHtml = stampAtoms(page)
      let inner = pageNumBadge() + omPill()
      let top = 90
      if (idx === 0) {
        inner += `<div  style="position:absolute;left:40px;top:90px;width:${PAGE_W - 80}px;font-size:40px;">Om Eiendommen</div>`
        inner += `<div  style="position:absolute;left:40px;top:167px;width:${PAGE_W - 80}px;font-size:30px;line-height:1.1;">${overskrift}</div>`
        top = 260
      }

      inner += richBox('om-beskrivelse', top, atomsHtml, { height: idx === 0 ? COLS_H_P0 : COLS_H })
      html += editorPage('page_90' + suffix(idx), '#e2cf9e', inner, 'om-page')
    })
    return html
  }


  pages.forEach((page, idx) => {
    const atomsHtml = stampAtoms(page)
    const { p49: p49Url, p90: p90Url, alt: omAlt, caption: omCaption } = omUrlsFor(idx)

    const omCoverCaption = omCaption
      ? `<div data-role="property-caption" data-locked="true" style="position:absolute;left:159px;top:915px;width:395px;min-height:58px;z-index:10;font-family:Helvetica;font-size:18px;color:rgb(0, 0, 0);text-align:center;line-height:1.2;word-break:break-word;background:${IMAGE_PAGE_BG};padding:18px;box-sizing:border-box;border-radius:20px">${omCaption}</div>`
      : ''
    html += editorPage(
      'page_49' + suffix(idx),
      '#e2cf9e',
      `<img data-role="property-photo" src="${p49Url}" alt="${omAlt}" style="position:absolute;left:0;top:0;width:${PAGE_W}px;height:${PAGE_H}px;object-fit:cover;" />` +
        omCoverCaption,
      'om-cover'
    )

    const textLeft = p90ImgW + padX
    const textWidth = p90TxtW - padX * 2
    // Top-anchored flow: container padding-top is constant; on page 0 the
    // heading block reserves OM_HEADING_HEIGHT before the description starts.
    const textTop = idx === 0 ? OM_TEXT_TOP_PADDING + OM_HEADING_HEIGHT : OM_TEXT_TOP_PADDING
    let inner =
      `<img data-role="property-photo" src="${p90Url}" alt="" style="position:absolute;left:0;top:0;width:${p90ImgW}px;height:${PAGE_H}px;object-fit:cover;" />` +
      omPill() +
      pageNumBadge()
    if (idx === 0) {
      inner +=
        `<div  style="position:absolute;left:${textLeft}px;top:${OM_TEXT_TOP_PADDING}px;width:${textWidth}px;font-size:40px;line-height:1.1;">Om Eiendommen</div>` +
        `<div  style="position:absolute;left:${textLeft}px;top:${OM_TEXT_TOP_PADDING + 55}px;width:${textWidth}px;font-size:28px;line-height:1.2;">${overskrift}</div>`
    }

    inner += richBox('om-beskrivelse', textTop, atomsHtml, {
      left: textLeft,
      width: textWidth,
      height: idx === 0 ? OM_FIRST_HEIGHT : OM_CONTENT_HEIGHT,
      cols: 1,
    })
    html += editorPage('page_90' + suffix(idx), '#e2cf9e', inner, 'om-page')
  })
  return html
}

// DIN MEGLER (page_91)
const meglerShowsMegler2 = (propertyDetail) =>
  !!(propertyDetail?.megler2 && (!propertyDetail?.megler1 || propertyDetail.megler2.email !== propertyDetail.megler1.email))

const meglerRowHtml = (propertyDetail, prefix, extraClass = '') => {
  const bilde = FIELD_MAP[`${prefix}.profilbilde`](propertyDetail) ?? ''
  const navn = FIELD_MAP[`${prefix}.navn`](propertyDetail) ?? ''
  const rolle = FIELD_MAP['megler.role'](propertyDetail) ?? ''
  const email = FIELD_MAP[`${prefix}.email`](propertyDetail) ?? ''
  const mobil = FIELD_MAP[`${prefix}.mobiltelefon`](propertyDetail) ?? ''
  return (
    `<div class="megler-top${extraClass}">` +
    `<div class="megler-image"><img src="${escAttr(bilde)}" data-field="${prefix}.profilbilde" /></div>` +
    `<div class="megler-content">` +
    `<div class="megler-name" data-field="${prefix}.navn">${escapeHTML(navn)}</div>` +
    `<div class="megler-role" data-field="megler.role">${escapeHTML(rolle)}</div>` +
    `<div class="megler-contact" data-field="${prefix}.email">${escapeHTML(email)}</div>` +
    `<div class="megler-contact" data-field="${prefix}.mobiltelefon">${escapeHTML(mobil)}</div>` +
    `</div></div>`
  )
}

function renderMegler(propertyDetail) {
  if (!propertyDetail?.megler1) return ''

  const showMegler2 = meglerShowsMegler2(propertyDetail)

  const inner =
    pageNumBadge() +
    '<div class="megler-section">' +
    '<h1 class="megler-name" style="font-size: 53.3333px;">Din megler</h1>' +
    '<div class="megler-box">' +
    meglerRowHtml(propertyDetail, 'megler1') +
    (showMegler2 ? meglerRowHtml(propertyDetail, 'megler2', ' mt-14') : '') +
    '</div></div>'

  return editorPage('page_91', '#e2cf9e', inner, 'megler')
}

function repairMegler($, propertyDetail) {
  if (!propertyDetail?.megler1) return
  const page = $('#page_91')
  if (!page.length) return

  if (page.find('[data-el]').length > 0) return

  const showMegler2 = meglerShowsMegler2(propertyDetail)

  let section = page.find('.megler-section').first()
  if (!section.length) {
    page.append('<div class="megler-section"></div>')
    section = page.find('.megler-section').first()
  }
  if (!section.find('> h1.megler-name').length) {
    section.prepend('<h1 class="megler-name" style="font-size: 53.3333px;">Din megler</h1>')
  }

  let box = section.find('.megler-box').first()
  if (!box.length) {
    section.append('<div class="megler-box"></div>')
    box = section.find('.megler-box').first()
  }

  const fixRow = (prefix, extraClass, positionalIndex) => {
    let row = box.find(`.megler-top:has([data-field^="${prefix}."])`).first()
    if (!row.length) row = box.find('.megler-top').eq(positionalIndex)

    const complete =
      row.length > 0 &&
      row.find(`[data-field="${prefix}.profilbilde"]`).length > 0 &&
      row.find(`[data-field="${prefix}.navn"]`).length > 0 &&
      row.find('[data-field="megler.role"]').length > 0 &&
      row.find(`[data-field="${prefix}.email"]`).length > 0 &&
      row.find(`[data-field="${prefix}.mobiltelefon"]`).length > 0

    if (complete) return

    const freshRow = meglerRowHtml(propertyDetail, prefix, extraClass)
    if (row.length) row.replaceWith(freshRow)
    else box.append(freshRow)
  }

  fixRow('megler1', '', 0)
  if (showMegler2) fixRow('megler2', ' mt-14', 1)
}

function renderAccordion(briefDetail, propertyDetail) {
  const pages = paginateAccordion(briefDetail)
  if (!pages.length) return ''

  const adresse = escapeHTML(propertyDetail?.eiendom?.adresse ?? '')
  let html = editorPage(
    'page_92',
    '#18344e',
    pageNumBadge() +
      `<div  data-field="eiendom.adresse" style="position:absolute;left:0;top:383px;width:${PAGE_W}px;text-align:center;color:#e2cf9e;font-size:13px;letter-spacing:1.1px;">${adresse}</div>` +
      `<div  style="position:absolute;left:0;top:408px;width:${PAGE_W}px;text-align:center;color:#e2cf9e;font-size:30px;">KORT OM EIENDOMMEN</div>`,
    'accordion-cover'
  )

  html += pages
    .map((page, idx) =>
      editorPage(
        'page_93' + (idx === 0 ? '' : '_' + idx) ,
        '#e2cf9e',
        pageNumBadge() +
          omPill() +
          richBox('accordion', 90, stampAtoms(page)),
        'accordion-page'
      )
    )
    .join('')

  return html
}

function syncBriefSection(savedHtml, rawBriefData, propertyDetail, propertyImages) {
  const $ = cheerio.load(savedHtml, { decodeEntities: false })
  const briefDetail = buildBriefGroups(rawBriefData)

  const omHasImg = Array.isArray(propertyImages) && propertyImages.length > 0
  const omChunkCount = omHasImg
    ? paginateOmSingle(getBeskrivelse(briefDetail), OM_FIRST_HEIGHT, OM_CONTENT_HEIGHT).length
    : 0

  const pageSel = 'div.page' // match by class, not id prefix
  const idOf = (el) => $(el).attr('id') || ''

  const isAcc = (el) => classifyPage($, el) === 'accordion'
  const isOm = (el) => classifyPage($, el) === 'om'

  const allPages = $(pageSel).toArray()
  const firstOmIdx = allPages.findIndex(isOm)

  const oldNokkelIdx = allPages.findIndex((el) => idOf(el) === 'page_48')
  const nokkelPrev =
    oldNokkelIdx > 0
      ? $(allPages[oldNokkelIdx - 1])
      : $('div[id^="page_img"]').length
        ? $('div[id^="page_img"]').last()
        : $('#page_2').length
          ? $('#page_2')
          : $(pageSel).first()

  const omFallbackAnchor =
    firstOmIdx > 0
      ? $(allPages[firstOmIdx - 1])
      : $('#page_48').length
        ? $('#page_48')
        : $('#page_2').length
          ? $('#page_2')
          : $(pageSel).first()

  $(pageSel).filter((_, el) => idOf(el) === 'page_48').remove()
  $(pageSel).filter((_, el) => isOm(el)).remove()
  $(pageSel).filter((_, el) => isAcc(el)).remove()

  const nokkelHtml = renderNokkel(propertyDetail)
  const omHtml = renderOm(briefDetail, propertyDetail, propertyImages)
  const accHtml = renderAccordion(briefDetail, propertyDetail)

  const safeAfter = (anchor, html) => {
    if (!html) return
    if (anchor && anchor.length) anchor.after(html)
    else $('body').append(html)
  }
  const safeBefore = (anchor, html) => {
    if (!html) return
    if (anchor && anchor.length) anchor.before(html)
    else safeAfter(nokkelPrev, html)
  }

  const meglerHtml = renderMegler(propertyDetail)
  let megler = $('#page_91')
  if (megler.length) {
    if (meglerHtml) {
      megler.replaceWith(meglerHtml)
      megler = $('#page_91')
    }
  } else if (meglerHtml) {
    safeAfter(nokkelPrev, meglerHtml)
    megler = $('#page_91')
  }

  if (megler.length) safeBefore(megler, nokkelHtml)
  else safeAfter(nokkelPrev, nokkelHtml)

  const omAnchor = megler.length
    ? megler
    : $('#page_48').length
      ? $('#page_48')
      : omFallbackAnchor
  if (omHtml) safeAfter(omAnchor, omHtml)

  if (accHtml) {
    const omsNow = $(pageSel).filter((_, el) => isOm(el))
    const accAnchor = omsNow.length
      ? omsNow.last()
      : megler.length
        ? megler
        : omAnchor
    safeAfter(accAnchor, accHtml)
  }

  $('#page_1000').remove()
  if ($(pageSel).length % 2 === 1) {
    const pad = editorPage('page_1000', '#18344E', pageNumBadge())
    if ($('#page_1001').length) $('#page_1001').before(pad)
    else $('body').append(pad)
  }

  return { html: $.html(), omChunkCount }
}

function renumberPages(savedHtml) {
  const $ = cheerio.load(savedHtml, { decodeEntities: false })
  let pageNo = 0
  $('[data-page]').each((_, el) => {
    pageNo++
    const badge = $(el).find('.page-num[data-field="page-num"]').first()
    if (badge.length) badge.text(String(pageNo))
    const pill = $(el).find('.om-pill').first()
    if (pill.length) pill.attr('class', 'om-pill ' + (pageNo % 2 === 0 ? 'om-pill-left' : 'om-pill-right'))
  })
  return $.html()
}

const IMAGE_PAGE_BG = 'rgb(226, 207, 158)'

const buildEditorImagePage = (pageId, imgSrc, alt, caption) => {
  const img = `<img data-role="property-photo" src="${imgSrc}" alt="${alt}" style="position:absolute;left:0px;top:0px;width:${PAGE_W}px;height:${PAGE_H}px;object-fit:cover">`
  const captionHtml = caption
    ? `<div data-role="property-caption" data-locked="true" style="position:absolute;left:159px;top:915px;width:395px;min-height:58px;z-index:10;font-family:Helvetica;font-size:18px;color:rgb(0, 0, 0);text-align:center;line-height:1.2;word-break:break-word;background:${IMAGE_PAGE_BG};padding:18px;box-sizing:border-box;border-radius:20px">${caption}</div>`
    : ''
  return `<div id="${pageId}" class="page" data-page="${pageId}" data-page-bg="${IMAGE_PAGE_BG}" style="position:relative;width:${PAGE_W}px;height:${PAGE_H}px;background:${IMAGE_PAGE_BG};overflow:hidden;page-break-after:always;break-after:page;">${img}${captionHtml}</div>`
}

const insertImagePage = ($, pageId, index, side, pageHtml) => {
  if (side === 'a') {
    const $b = $(`#page_img${index}b`)
    if ($b.length) return $b.before(pageHtml)
  } else {
    const $a = $(`#page_img${index}a`)
    if ($a.length) return $a.after(pageHtml)
  }
  const $prevB = $(`#page_img${index - 1}b`)
  if ($prevB.length) return $prevB.after(pageHtml)
  const $nextA = $(`#page_img${index + 1}a`)
  if ($nextA.length) return $nextA.before(pageHtml)
  const $lastImg = $('div[id^="page_img"]').last()
  if ($lastImg.length) return $lastImg.after(pageHtml)
  const $page2 = $('#page_2')
  if ($page2.length) return $page2.after(pageHtml)
  const $page48 = $('#page_48')
  if ($page48.length) return $page48.before(pageHtml)
  return $('body').append(pageHtml)
}

const buildFloorplanCoverPage = (adresse) =>
  `<div id="page_floorplan_title" data-page="page_floorplan_title" class="pdf24_ pdf24_02 blueBg flex flex-col items-center" data-field="floorplan-cover">` +
  pageNumBadge() +
  '<div class="w-full text-center px-2 break-all" style="padding-top: 100mm;">' +
  `<span class="pdf24_07 pdf24_08 pdf24_09" data-field="eiendom.adresse">${escapeHTML(adresse || '')}</span>` +
  '</div>' +
  '<div class="w-full text-center px-2 break-all">' +
  '<span class="pdf24_10 pdf24_11 pdf24_12" style="word-spacing:0.0184em;">PLANTEGNING</span>' +
  '</div>' +
  '</div>'


const syncPropertyImages = (savedHtml, propertyImages, omSkip = 0) => {
  const $ = cheerio.load(savedHtml, { decodeEntities: false })
  const images = sortImagesForLayout(propertyImages)

  const changed = []

  if (!images.length) {
    return { html: $.html(), changed }
  }

  const $oldGalleryPages = $('div[id^="page_img"], div[id^="page_floorplan"]').toArray().map(el => el.id)
  if ($oldGalleryPages.length) {
    changed.push({ page: $oldGalleryPages.join(", "), from: "exists", to: "removed" })
    $('div[id^="page_img"], div[id^="page_floorplan"]').remove()
  }

  const adresse = $('[data-field="eiendom.adresse"]').first().text().trim()

  const anchor =
    $('[data-field="om-page"]').last().length ? $('[data-field="om-page"]').last()
      : $('[data-field="om-cover"]').last().length ? $('[data-field="om-cover"]').last()
        : $('#page_91').length ? $('#page_91')
          : $('#page_48').length ? $('#page_48')
            : $('#page_2').length ? $('#page_2')
              : null

  let cursor = anchor

  const insertAfterCursor = (pageId, html) => {
    if (cursor && cursor.length) cursor.after(html)
    else $('body').append(html)
    const $inserted = $(`#${pageId}`)
    if ($inserted.length) cursor = $inserted
  }

  let floorplanTitleInserted = false

  images.forEach((image, index) => {
    if (!image?.url) return

    if (index >= 1 && index <= omSkip) return

    const encoded = encodeURIComponent(image.url)
    const alt = (image.beskrivelse || '').toString().replace(/"/g, '&quot;')

    if (isFloorplanImage(image)) {
      if (!floorplanTitleInserted) {
        floorplanTitleInserted = true
        const coverHtml = buildFloorplanCoverPage(adresse)
        insertAfterCursor('page_floorplan_title', coverHtml)
        changed.push({ page: 'page_floorplan_title', from: null, to: 'inserted', rebuiltPage: true })
      }

      const pageId = `page_floorplan_${index}`
      const fullSrc = `https://images.weserv.nl/?url=${encoded}&w=${PAGE_W}&h=${PAGE_H}&fit=cover`
      const caption = image.beskrivelse && image.beskrivelse.trim() !== '' ? image.beskrivelse.trim() : ''

      const pageHtml = buildEditorImagePage(pageId, fullSrc, alt, caption)
      insertAfterCursor(pageId, pageHtml)
      changed.push({ page: `#${pageId} img`, from: null, to: fullSrc, rebuiltPage: true })
      if (caption) changed.push({ page: `#${pageId} caption`, from: null, to: caption })
      return
    }

    const pages = [
      { pageId: `page_img${index}a`, side: 'a' },
      { pageId: `page_img${index}b`, side: 'b' },
    ]

    pages.forEach(({ pageId, side }) => {
      const weservSrc =
        side === 'a'
          ? `https://images.weserv.nl/?url=${encoded}&w=1588&h=1123&fit=cover&cx=0&cy=0&cw=794&ch=1123`
          : `https://images.weserv.nl/?url=${encoded}&w=1588&h=1123&fit=cover&cx=794&cy=0&cw=794&ch=1123`
      const caption = side === 'a' ? alt : ''

      const pageHtml = buildEditorImagePage(pageId, weservSrc, alt, caption)
      insertAfterCursor(pageId, pageHtml)
      changed.push({ page: `#${pageId} img`, from: null, to: weservSrc, rebuiltPage: true })
      if (caption) changed.push({ page: `#${pageId} caption`, from: null, to: caption })
    })
  })

  return { html: $.html(), changed }
}

const SPREAD_W = PAGE_W * 2 // 1588px

function buildImagePagePair(image, index) {
  const enc = encodeURIComponent(image.url)
  const spreadBase = `https://images.weserv.nl/?url=${enc}&w=${SPREAD_W}&h=${PAGE_H}&fit=cover`
  const leftHalf = `${spreadBase}&cx=0&cy=0&cw=${PAGE_W}&ch=${PAGE_H}`
  const rightHalf = `${spreadBase}&cx=${PAGE_W}&cy=0&cw=${PAGE_W}&ch=${PAGE_H}`
  const alt = image.beskrivelse ? String(image.beskrivelse).replace(/"/g, '&quot;') : ''
  const caption = image.beskrivelse?.trim() ? `<p class="img_decs">${image.beskrivelse.trim()}</p>` : ''

  return (
    `<div id="page_img${index}a" class="pdf24_ pdf24_02 break-after-page break-before-page" style="padding:0;overflow:hidden;position:relative;">` +
    `<div class="pdf24_03">` +
    `<img src="${leftHalf}" alt="${alt}" class="pdf24_04" />` +
    caption +
    `</div>` +
    `</div>` +
    `<div id="page_img${index}b" class="pdf24_ pdf24_02 break-after-page break-before-page" style="padding:0;overflow:hidden;position:relative;">` +
    `<div class="pdf24_03">` +
    `<img src="${rightHalf}" alt="${alt}" class="pdf24_04" />` +
    `</div>` +
    `</div>`
  )
}

const DOC_COVER_FIELD = 'document-cover'
const DOC_PAGE_FIELD = 'document-page'

const escAttr = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

const pageIdNum = (id = '') => {
  const m = /^page_(\d+)$/.exec(id)
  return m ? Number(m[1]) : NaN
}

const isDocCoverPage = ($el) =>
  $el.attr('data-field') === DOC_COVER_FIELD || $el.attr('id') === 'page_400'

const isDocImagePage = ($el) => {
  if ($el.attr('data-field') === DOC_PAGE_FIELD) return true
  const n = pageIdNum($el.attr('id') || '')
  return n >= 401 && n <= 999
}

const isEndPage = ($el) => {
  const id = $el.attr('id') || ''
  if (id === 'page_200' || id === 'page_201' || id === 'page_250') return true
  return pageIdNum(id) >= 1000
}

const docPageNumBadge = (pageNo) =>
  '<div class="page-num-bar">' +
  '<img class="page-num-line" data-locked="true" src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\'/%3E" alt="" />' +
  `<div class="page-num" data-field="page-num">${pageNo}</div>` +
  '</div>'

const buildDocCoverPage = (adresse, pageNo) =>
  `<div id="page_400" data-page="page_400" class="pdf24_ pdf24_02 blueBg flex flex-col items-center" data-field="${DOC_COVER_FIELD}">` +
  docPageNumBadge(pageNo) +
  '<div class="w-full text-center px-2 break-all" style="padding-top: 100mm;">' +
  `<span class="pdf24_07 pdf24_08 pdf24_09" data-field="eiendom.adresse">${escapeHTML(adresse || '')}</span>` +
  '</div>' +
  '<div class="w-full text-center px-2 break-all">' +
  '<span class="pdf24_10 pdf24_11 pdf24_12" style="word-spacing:0.0184em;">VEDLEGG</span>' +
  '</div>' +
  '</div>'

const buildDocImagePage = (pageId, imgSrc, alt) =>
  `<div id="${pageId}" data-page="${pageId}" class="pdf24_ pdf24_02 whiteBg break-after-page break-before-page" data-field="${DOC_PAGE_FIELD}">` +
  '<div class="pdf24_03">' +
  `<img data-role="document-photo" src="${escAttr(imgSrc)}" alt="${escAttr(alt)}" class="pdf24_05" />` +
  '</div>' +
  '</div>'

const syncDocumentImages = (savedHtml, documentImages, propertyDetail, img = true) => {
  if (img === false) return { html: savedHtml, changed: [] }

  const $ = cheerio.load(savedHtml, { decodeEntities: false })
  const changed = []
  const docs = Array.isArray(documentImages) ? documentImages : []

  const removedImageIds = []
  $('div[id^="page_"]').each((_, el) => {
    const $el = $(el)
    if (isDocImagePage($el) && !isDocCoverPage($el)) {
      removedImageIds.push($el.attr('id'));
      $el.remove();
    }
  })
  if (removedImageIds.length) {
    changed.push({ page: removedImageIds.join(', '), from: 'exists', to: 'removed' })
  }

  let counter = 401
  const imagePages = []
  docs.forEach((doc) => {
    const images = Array.isArray(doc?.images) ? doc.images : []
    images.forEach((imgSrc, idx) => {
      if (!imgSrc) return
      const pageId = `page_${counter++}`
      const alt = `${doc?.navn || 'Dokument'} side ${idx + 1}`
      imagePages.push(buildDocImagePage(pageId, imgSrc, alt))
    })
  })

  let $divider = null
  $('div[id^="page_"]').each((_, el) => {
    const $el = $(el)
    if (!$divider && isDocCoverPage($el)) $divider = $el
  })

  if (imagePages.length === 0) {
    if ($divider) {
      changed.push({ page: $divider.attr('id') || 'page_400', from: 'exists', to: 'removed' })
      $divider.remove()
    }
    return { html: $.html(), changed }
  }

  if (!$divider) {
    const allPages = $('div[id^="page_"]').toArray()
    const anchorEl = allPages.find((el) => isEndPage($(el)))
    const pageNo = anchorEl ? allPages.indexOf(anchorEl) + 1 : allPages.length + 1
    const coverHtml = buildDocCoverPage(propertyDetail?.eiendom?.adresse, pageNo)

    if (anchorEl) {
      $(anchorEl).before(coverHtml)
    } else {
      const accordion = $('div[id^="page_93"]').toArray()
      if (accordion.length) $(accordion[accordion.length - 1]).after(coverHtml)
      else $('body').append(coverHtml)
    }
    changed.push({ page: 'page_400', from: null, to: 'document-cover (created)' })

    $('div[id^="page_"]').each((_, el) => {
      const $el = $(el)
      if (!$divider && isDocCoverPage($el)) $divider = $el
    })
  }

  if ($divider) {
    $divider.after(imagePages.join(''))
    changed.push({
      page: `page_401..page_${counter - 1}`,
      from: null,
      to: `${imagePages.length} document page(s)`,
    })
  }

  return { html: $.html(), changed }
}

const RESTORE_FIELDS = {
  page_0: [
    { field: 'eiendom.kommune', tag: 'div', style: 'position:absolute;left:364px;top:383px;width:67px;min-height:15px;font-family:Helvetica;font-size:13.3333px;color:rgb(213, 199, 179);text-align:center;line-height:1.2;letter-spacing:1.1233px;word-break:break-word' },
    { field: 'eiendom.adresse', tag: 'div', style: 'position:absolute;left:280px;top:408px;width:235px;min-height:44px;font-family:Helvetica;font-size:40px;color:rgb(213, 199, 179);text-align:center;line-height:1;letter-spacing:-0.3673px;word-spacing:0.736px;word-break:break-word' },
  ],
  page_91: [
    { field: 'megler1.profilbilde', tag: 'img', style: 'position:absolute;left:80px;top:267px;width:260px;height:260px;object-fit:cover;border-radius:20px;box-shadow:rgba(0, 0, 0, 0.3) 0px 0px 5px 0px' },
    { field: 'megler1.navn', tag: 'div', style: 'position:absolute;left:400px;top:267px;width:248px;min-height:51px;font-family:Helvetica;font-size:34px;color:rgb(43, 43, 43);line-height:1.2;word-break:break-word' },
    { field: 'megler1.email', tag: 'div', style: 'position:absolute;left:400px;top:385px;width:248px;min-height:27px;font-family:Helvetica;font-size:18px;color:rgb(43, 43, 43);line-height:1.2;word-break:break-word' },
    { field: 'megler1.mobiltelefon', tag: 'div', style: 'position:absolute;left:400px;top:418px;width:248px;min-height:27px;font-family:Helvetica;font-size:18px;color:rgb(43, 43, 43);line-height:1.2;word-break:break-word' },
    { field: 'megler2.profilbilde', tag: 'img', megler2: true, style: 'position:absolute;left:80px;top:583px;width:260px;height:260px;object-fit:cover;border-radius:20px;box-shadow:rgba(0, 0, 0, 0.3) 0px 0px 5px 0px' },
    { field: 'megler2.navn', tag: 'div', megler2: true, style: 'position:absolute;left:400px;top:583px;width:225px;min-height:51px;font-family:Helvetica;font-size:34px;color:rgb(43, 43, 43);line-height:1.2;word-break:break-word' },
    { field: 'megler2.email', tag: 'div', megler2: true, style: 'position:absolute;left:400px;top:701px;width:225px;min-height:27px;font-family:Helvetica;font-size:18px;color:rgb(43, 43, 43);line-height:1.2;word-break:break-word' },
    { field: 'megler2.mobiltelefon', tag: 'div', megler2: true, style: 'position:absolute;left:400px;top:734px;width:225px;min-height:27px;font-family:Helvetica;font-size:18px;color:rgb(43, 43, 43);line-height:1.2;word-break:break-word' },
  ],
  page_400: [
    { field: 'eiendom.adresse', tag: 'div', style: 'position:absolute;left:351px;top:383px;width:93px;min-height:15px;font-family:Helvetica;font-size:13.3333px;color:rgb(213, 199, 179);text-align:center;line-height:1.2;letter-spacing:1.1233px;word-break:break-word' },
  ],
}

let _restoreSeq = 0
const restoreElId = () => `sync-restore-${Date.now().toString(36)}-${_restoreSeq++}`

function restoreMissingFields(savedHtml, propertyDetail) {
  const $ = cheerio.load(savedHtml, { decodeEntities: false })
  const changed = []
  const showMegler2 = meglerShowsMegler2(propertyDetail)

  for (const [pageId, specs] of Object.entries(RESTORE_FIELDS)) {
    const $page = $(`#${pageId}`)
    if (!$page.length) continue

    if (!$page.find('[data-el]').length) continue

    if (pageId === 'page_91' && !showMegler2) {
      const $m2 = $page.find('[data-el][data-field^="megler2."]')
      if ($m2.length) {
        $m2.remove()

        $page.find('[data-el][data-field="megler.role"]').slice(1).remove()
        changed.push({ page: pageId, field: 'megler2.*', from: 'exists', to: 'removed' })
      }
    }

    for (const spec of specs) {
      if (spec.megler2 && !showMegler2) continue

      if ($page.find(`[data-el][data-field="${spec.field}"]`).length > 0) continue

      const fmt = FIELD_MAP[spec.field]
      const value = fmt ? fmt(propertyDetail) : null
      if (value == null) continue

      const id = restoreElId()
      const el =
        spec.tag === 'img'
          ? `<img data-el="${id}" data-field="${spec.field}" src="${escAttr(String(value))}" style="${spec.style}" />`
          : `<div data-el="${id}" data-field="${spec.field}" style="${spec.style}">${escapeHTML(String(value))}</div>`
      $page.append(el)
      changed.push({ page: pageId, field: spec.field, from: null, to: 'restored' })
    }
  }

  return { html: $.html(), changed }
}

const _GEO_KEYS = ['left', 'top', 'width', 'height']

const readGeom = (style = '') => {
  const g = {}
  for (const k of _GEO_KEYS) {
    const m = style.match(new RegExp('(?:^|;)\\s*' + k + '\\s*:\\s*([^;]+)'))
    if (m) g[k] = m[1].trim()
  }
  return g
}

const writeGeom = (style = '', geom) => {
  let s = style
  for (const k of _GEO_KEYS) {
    if (geom[k] == null) continue
    const re = new RegExp('((?:^|;)\\s*' + k + '\\s*:\\s*)([^;]+)')
    if (re.test(s)) s = s.replace(re, `$1${geom[k]}`)
    else s = s.replace(/;\s*$/, '') + ';' + k + ':' + geom[k]
  }
  return s
}

const geomRoleOf = ($el) => {
  if ($el.attr('data-richtext') === 'true') return 'richtext'
  const dr = $el.attr('data-role')
  if (dr === 'property-photo') return 'photo'
  if (dr === 'property-caption') return 'caption'
  const df = $el.attr('data-field')
  if (df) return 'field:' + df
  return null
}

function preserveEditedGeometry(savedHtml, rebuiltHtml) {
  const $b = cheerio.load(savedHtml, { decodeEntities: false })
  const $a = cheerio.load(rebuiltHtml, { decodeEntities: false })

  const keyFor = ($, el, seen) => {
    const $el = $(el)
    const style = $el.attr('style') || ''
    if (!/position\s*:\s*absolute/i.test(style)) return null
    const role = geomRoleOf($el)
    if (!role) return null
    const $page = $el.closest('[data-page]')
    const pageId = $page.attr('id') || $page.attr('data-page') || '_'
    if (pageId === 'page_48' || pageId === 'page_91') return null
    const base = `${pageId}|${role}`
    const n = (seen[base] = (seen[base] || 0) + 1)
    return { key: `${base}#${n}`, style }
  }

  const saved = {}
  const seenB = {}
  $b('[style]').each((_, el) => {
    const info = keyFor($b, el, seenB)
    if (!info) return
    const g = readGeom(info.style)
    if (Object.keys(g).length) saved[info.key] = g
  })

  let restored = 0
  const seenA = {}
  $a('[style]').each((_, el) => {
    const info = keyFor($a, el, seenA)
    if (!info) return
    const g = saved[info.key]
    if (!g) return
    const next = writeGeom(info.style, g)
    if (next !== info.style) {
      $a(el).attr('style', next)
      restored++
    }
  })

  return { html: $a.html(), restored }
}

function preserveSectionOrder(savedHtml, rebuiltHtml) {
  const $s = cheerio.load(savedHtml, { decodeEntities: false })
  const $r = cheerio.load(rebuiltHtml, { decodeEntities: false })

  const detect = ($) => $('[data-page], [id^="page_"]').toArray()
  const idOf = ($, el) => $(el).attr('id') || $(el).attr('data-page') || ''

  const rebuiltPages = detect($r)
  if (!rebuiltPages.length) return { html: rebuiltHtml, reordered: false }

  const savedSeq = []
  const seenSaved = new Set()
  detect($s).forEach((el) => {
    const key = classifyPage($s, el)
    if (!seenSaved.has(key)) { seenSaved.add(key); savedSeq.push(key) }
  })

  const groups = new Map()
  const rebuiltIds = []
  rebuiltPages.forEach((el) => {
    const key = classifyPage($r, el)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(el)
    rebuiltIds.push(idOf($r, el))
  })

  const finalOrder = savedSeq.filter((k) => groups.has(k))
  const placed = new Set(finalOrder)
  const extras = [...groups.keys()]
    .filter((k) => !placed.has(k))
    .sort((x, y) => canonRank(x) - canonRank(y))
  extras.forEach((key) => {
    const r = canonRank(key)
    let insertAt = finalOrder.length
    if (r !== Infinity) {
      for (let i = finalOrder.length - 1; i >= 0; i--) {
        const fr = canonRank(finalOrder[i])
        if (fr !== Infinity && fr < r) { insertAt = i + 1; break }
        if (i === 0) insertAt = 0
      }
    }
    finalOrder.splice(insertAt, 0, key)
    placed.add(key)
  })
  groups.forEach((_v, k) => { if (!placed.has(k)) { finalOrder.push(k); placed.add(k) } })

  const ordered = []
  finalOrder.forEach((key) => (groups.get(key) || []).forEach((el) => ordered.push(el)))

  const outIds = ordered.map((el) => idOf($r, el))
  if (outIds.length !== rebuiltIds.length || new Set(outIds).size !== new Set(rebuiltIds).size) {
    return { html: rebuiltHtml, reordered: false }
  }

  const firstEl = rebuiltPages[0]
  const $parent = $r(firstEl).parent()
  const prevNode = $r(firstEl).prev()
  const anchorNode = prevNode.length ? prevNode.get(0) : null
  ordered.forEach((el) => $r(el).remove())
  let cursor = anchorNode
  ordered.forEach((el) => {
    if (cursor) $r(cursor).after(el)
    else if ($parent.length) $parent.prepend(el)
    else $r.root().append(el)
    cursor = el
  })

  return { html: $r.html(), reordered: true }
}

function syncAll(savedHtml, propertyDetail, rawBriefData, propertyImages, documentImages, img) {
  fixDetailStrings(propertyDetail);
  fixBriefData(rawBriefData);
  const a = syncTextFromWebmegler(savedHtml, propertyDetail)
  const b = syncBriefSection(a.html, rawBriefData, propertyDetail, propertyImages ?? [])
  const c = syncPropertyImages(b.html, img ? propertyImages : [], b.omChunkCount)
  const d = syncDocumentImages(c.html, documentImages ?? [], propertyDetail, img)
  const e = restoreMissingFields(d.html, propertyDetail)
  const f = preserveEditedGeometry(savedHtml, e.html)
  const g = preserveSectionOrder(savedHtml, f.html)
  const html = renumberPages(g.html)
  return {
    html,
    changed: [
      ...a.changed,
      ...c.changed,
      ...d.changed,
      ...e.changed,
    ],
    skipped: a.skipped
  };
}

export { syncTextFromWebmegler, syncBriefSection, syncPropertyImages, syncDocumentImages, restoreMissingFields, syncAll, FIELD_MAP }