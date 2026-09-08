const UNICODE_ESCAPE_PATTERN = /\\u[0-9a-fA-F]{4}/g;
const MOJIBAKE_PATTERN = /Ã|Â|áº|á»|Ä|Æ|Ð|ð|Ă|�/;
const BAD_TOKEN_PATTERN = /Ã|Â|áº|á»|Ä|Æ|Ð|ð|Ă|�|\\u[0-9a-fA-F]{4}/g;

const WINDOWS_1252_BYTES = {
  '€': 0x80,
  '‚': 0x82,
  'ƒ': 0x83,
  '„': 0x84,
  '…': 0x85,
  '†': 0x86,
  '‡': 0x87,
  'Ë†': 0x88,
  '‰': 0x89,
  'Å ': 0x8a,
  '‹': 0x8b,
  'Å’': 0x8c,
  'Å½': 0x8e,
  '‘': 0x91,
  '’': 0x92,
  '“': 0x93,
  '”': 0x94,
  '•': 0x95,
  '–': 0x96,
  '—': 0x97,
  'Ëœ': 0x98,
  '™': 0x99,
  'Å¡': 0x9a,
  '›': 0x9b,
  'Å“': 0x9c,
  'Å¾': 0x9e,
  'Å¸': 0x9f,
};

const MANUAL_REPLACEMENTS = [
  ['Ă¡', 'á'], ['Ă ', 'à'], ['Ă ', 'à'], ['Ă¢', 'â'], ['Ă£', 'ã'], ['Ă¤', 'ä'],
  ['Ă©', 'é'], ['Ă¨', 'è'], ['Ăª', 'ê'], ['Ă«', 'ë'], ['Ă­', 'í'], ['Ă¬', 'ì'],
  ['Ă³', 'ó'], ['Ă²', 'ò'], ['Ă´', 'ô'], ['Ăµ', 'õ'], ['Ă¶', 'ö'], ['Ăº', 'ú'],
  ['Ă¹', 'ù'], ['Ă½', 'ý'], ['Ă¿', 'ÿ'], ['Ä‘', 'đ'], ['Ä', 'Đ'],
  ['Æ°', 'ư'], ['Æ¡', 'ơ'], ['Æ¯', 'Ư'], ['ÆƠ', 'Ơ'],
  ['Ã ', 'à'], ['Ã¡', 'á'], ['Ã ', 'à'], ['Ã¢', 'â'], ['Ã£', 'ã'], ['Ã©', 'é'], ['Ã¨', 'è'],
  ['Ãª', 'ê'], ['Ã­', 'í'], ['Ã¬', 'ì'], ['Ã³', 'ó'], ['Ã²', 'ò'], ['Ã´', 'ô'],
  ['Ãµ', 'õ'], ['Ãº', 'ú'], ['Ã¹', 'ù'], ['Ã½', 'ý'], ['Äƒ', 'ă'], ['Ä©', 'ĩ'],
  ['áº¡', 'ạ'], ['áº£', 'ả'], ['áº¥', 'ấ'], ['áº§', 'ầ'], ['áº©', 'ẩ'], ['áº«', 'ẫ'], ['áº­', 'ậ'],
  ['áº¯', 'ắ'], ['áº±', 'ằ'], ['áº³', 'ẳ'], ['áºµ', 'ẵ'], ['áº·', 'ặ'],
  ['áº¹', 'ẹ'], ['áº»', 'ẻ'], ['áº½', 'ẽ'], ['áº¿', 'ế'], ['á»', 'ề'], ['á»ƒ', 'ể'], ['á»…', 'ễ'], ['á»‡', 'ệ'],
  ['á»‰', 'ỉ'], ['á»‹', 'ị'], ['á»', 'ọ'], ['á»', 'ỏ'], ['á»‘', 'ố'], ['á»“', 'ồ'], ['á»•', 'ổ'], ['á»—', 'ỗ'], ['á»™', 'ộ'],
  ['á»›', 'ớ'], ['á»', 'ờ'], ['á»Ÿ', 'ở'], ['á»¡', 'ỡ'], ['á»£', 'ợ'],
  ['á»¥', 'ụ'], ['á»§', 'ủ'], ['á»©', 'ứ'], ['á»«', 'ừ'], ['á»­', 'ử'], ['á»¯', 'ữ'], ['á»±', 'ự'],
  ['á»³', 'ỳ'], ['á»·', 'ỷ'], ['á»¹', 'ỹ'],
];

function countBadTokens(text) {
  return (String(text).match(BAD_TOKEN_PATTERN) || []).length;
}

function decodeUnicodeEscapes(text) {
  return String(text).replace(UNICODE_ESCAPE_PATTERN, (match) =>
    String.fromCharCode(Number.parseInt(match.slice(2), 16))
  );
}

function byteForMojibakeChar(char) {
  const code = char.charCodeAt(0);
  if (code <= 0xff) return code;
  return WINDOWS_1252_BYTES[char] ?? null;
}

function decodeWindows1252Utf8(text, fatal = false) {
  if (typeof TextDecoder === 'undefined') return text;
  const bytes = [];
  for (const char of String(text)) {
    const byte = byteForMojibakeChar(char);
    if (byte === null) return text;
    bytes.push(byte);
  }
  return new TextDecoder('utf-8', { fatal }).decode(Uint8Array.from(bytes));
}

function applyManualReplacements(text) {
  let result = String(text);
  for (const [bad, good] of MANUAL_REPLACEMENTS) {
    result = result.split(bad).join(good);
  }
  return result;
}

function fixMojibakeWord(word) {
  if (!MOJIBAKE_PATTERN.test(word)) return word;

  let best = applyManualReplacements(word);
  try {
    const decoded = decodeWindows1252Utf8(word, true);
    if (countBadTokens(decoded) < countBadTokens(best) && !decoded.includes('ï¿½')) {
      best = decoded;
    }
  } catch {
    // Keep manual replacement result.
  }
  return countBadTokens(best) <= countBadTokens(word) ? best : word;
}

function fixMixedMojibake(text) {
  return String(text).replace(/[^\s]+/g, fixMojibakeWord);
}

export function fixVietnameseText(value) {
  if (value === null || value === undefined) return value;

  const text = String(value);
  const unescaped = decodeUnicodeEscapes(text);
  if (!MOJIBAKE_PATTERN.test(unescaped)) return unescaped;

  const wordFixed = fixMixedMojibake(unescaped);
  const manualFixed = applyManualReplacements(wordFixed);

  try {
    const decodedWhole = decodeWindows1252Utf8(unescaped, true);
    if (countBadTokens(decodedWhole) < countBadTokens(manualFixed) && !decodedWhole.includes('ï¿½')) {
      return decodedWhole;
    }
  } catch {
    // Mixed Vietnamese + mojibake should prefer word-level repair.
  }

  return manualFixed;
}

export function fixMaybeText(value, fallback = '') {
  const fixed = fixVietnameseText(value);
  return fixed === null || fixed === undefined || fixed === '' ? fallback : fixed;
}
