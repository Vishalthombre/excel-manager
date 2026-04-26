// frontend/src/utils/searchLogic.js

const devanagariMap = {
  'अ': 'a', 'आ': 'a', 'इ': 'i', 'ई': 'i', 'उ': 'u', 'ऊ': 'u', 'ए': 'e', 'ऐ': 'e', 'ओ': 'o', 'औ': 'o',
  'क': 'k', 'ख': 'k', 'ग': 'g', 'घ': 'g', 'ङ': 'n',
  'च': 'ch', 'छ': 'ch', 'ज': 'j', 'झ': 'j', 'ञ': 'n',
  'ट': 't', 'ठ': 't', 'ड': 'd', 'ढ': 'd', 'ण': 'n',
  'त': 't', 'थ': 't', 'द': 'd', 'ध': 'd', 'न': 'n',
  'प': 'p', 'फ': 'p', 'ब': 'b', 'भ': 'b', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 's', 'ष': 's', 'स': 's', 'ह': 'h',
  'ळ': 'l', 'क्ष': 'x', 'ज्ञ': 'gy',
  'ा': 'a', 'ि': 'i', 'ी': 'i', 'ु': 'u', 'ू': 'u', 'ृ': 'r', 'े': 'e', 'ै': 'e', 'ो': 'o', 'ौ': 'o', 'ं': 'n', 'ः': 'h', '्': ''
};

// Converts Hindi/Marathi to Latin base
const transliterate = (text) => {
  let result = "";
  for (let char of String(text).toLowerCase()) {
    result += devanagariMap[char] || char;
  }
  return result;
};

// Strips vowels and special characters to create a Phonetic "Skeleton"
const getSkeleton = (text) => {
  return text.replace(/[aeiouy\W0-9_]/g, '');
};

// Calculates how many "typos" exist between two strings
const levenshtein = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

export const executeSmartSearch = (masterData, selectedColumn, searchQuery) => {
  if (!searchQuery.trim() || !selectedColumn) return [];

  const queryTrans = transliterate(searchQuery);
  const querySkel = getSkeleton(queryTrans);

  return masterData.filter(row => {
    const cellValue = String(row[selectedColumn] || "");
    const cellTrans = transliterate(cellValue);
    const cellSkel = getSkeleton(cellTrans);
    
    // TIER 1: Exact Substring Match (e.g., "Ramesh" inside "Patil Ramesh")
    if (cellTrans.includes(queryTrans)) return true;

    // TIER 2: Phonetic Substring Match (Solves the "tabdil" half-word issue)
    // If query is "tabdil" (tbdl) and cell is "तबदीलपत्र" (tbdlptr), this matches instantly.
    if (querySkel.length > 0 && cellSkel.includes(querySkel)) return true;

    // TIER 3: Fuzzy Typo Match (Solves misspelling like "tablipatra" instead of "tabdeelpatra")
    const cellWords = cellTrans.split(/\s+/);
    for (let word of cellWords) {
        const wordSkel = getSkeleton(word);
        if (wordSkel.length > 0 && querySkel.length > 0) {
            const maxTypos = Math.max(1, Math.floor(querySkel.length / 4));
            const dist = levenshtein(querySkel, wordSkel);
            if (dist <= maxTypos) return true;
        }
    }
    
    return false;
  });
};