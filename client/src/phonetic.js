/**
 * Copied and modified from https://github.com/TomFrost/node-phonetic
 */

/**
 * Phonetics that sound best before a vowel.
 * @type {Array}
 */
const PHONETIC_PRE = [
  // Simple phonetics
  "b",
  "c",
  "d",
  "f",
  "g",
  "h",
  "j",
  "k",
  "l",
  "m",
  "n",
  "p",
  "qu",
  "r",
  "s",
  "t",
  // Complex phonetics
  "bl",
  "ch",
  "cl",
  "cr",
  "dr",
  "fl",
  "fr",
  "gl",
  "gr",
  "kl",
  "kr",
  "ph",
  "pr",
  "pl",
  "sc",
  "sh",
  "sl",
  "sn",
  "sr",
  "st",
  "str",
  "sw",
  "th",
  "tr",
  "br",
  "v",
  "w",
  "y",
  "z",
];

/**
 * The number of simple phonetics within the 'pre' set.
 * @type {number}
 */
const PHONETIC_PRE_SIMPLE_LENGTH = 16;

/**
 * Vowel sound phonetics.
 * @type {Array}
 */
const PHONETIC_MID = [
  // Simple phonetics
  "a",
  "e",
  "i",
  "o",
  "u",
  // Complex phonetics
  "ee",
  "ie",
  "oo",
  "ou",
  "ue",
];

/**
 * The number of simple phonetics within the 'mid' set.
 * @type {number}
 */
const PHONETIC_MID_SIMPLE_LENGTH = 5;

/**
 * Phonetics that sound best after a vowel.
 * @type {Array}
 */
const PHONETIC_POST = [
  // Simple phonetics
  "b",
  "d",
  "f",
  "g",
  "k",
  "l",
  "m",
  "n",
  "p",
  "r",
  "s",
  "t",
  "y",
  // Complex phonetics
  "ch",
  "ck",
  "ln",
  "nk",
  "ng",
  "rn",
  "sh",
  "sk",
  "st",
  "th",
  "x",
  "z",
];

/**
 * The number of simple phonetics within the 'post' set.
 * @type {number}
 */
const PHONETIC_POST_SIMPLE_LENGTH = 13;

/**
 * A mapping of regular expressions to replacements, which will be run on the
 * resulting word before it gets returned.  The purpose of replacements is to
 * address language subtleties that the phonetic builder is incapable of
 * understanding, such as 've' more pronounceable than just 'v' at the end of
 * a word, 'ey' more pronounceable than 'iy', etc.
 * @type {{}}
 */
const REPLACEMENTS = {
  quu: "que",
  "qu([aeiou]){2}": "qu$1",
  "[iu]y": "ey",
  eye: "ye",
  "(.)ye$": "$1y",
  "(^|e)cie(?!$)": "$1cei",
  "([vz])$": "$1e",
  "[iu]w": "ow",
};

/**
 * Adds a single syllable to the word contained in the wordObj.  A syllable
 * contains, at maximum, a phonetic from each the PRE, MID, and POST phonetic
 * sets.  Some syllables will omit pre or post based on the
 * options.compoundSimplicity.
 *
 * @param {{word, numeric, lastSkippedPre, lastSkippedPost, opts}} wordObj The
 *      word object on which to operate.
 */
function addSyllable(wordObj) {
  var deriv = getDerivative(wordObj.numeric),
    compound = deriv % wordObj.opts.compoundSimplicity === 0,
    first = wordObj.word === "",
    preOnFirst = deriv % 6 > 0;
  if ((first && preOnFirst) || wordObj.lastSkippedPost || compound) {
    wordObj.word += getNextPhonetic(PHONETIC_PRE, PHONETIC_PRE_SIMPLE_LENGTH, wordObj);
    wordObj.lastSkippedPre = false;
  } else wordObj.lastSkippedPre = true;
  wordObj.word += getNextPhonetic(PHONETIC_MID, PHONETIC_MID_SIMPLE_LENGTH, wordObj, first && wordObj.lastSkippedPre);
  if (wordObj.lastSkippedPre || compound) {
    wordObj.word += getNextPhonetic(PHONETIC_POST, PHONETIC_POST_SIMPLE_LENGTH, wordObj);
    wordObj.lastSkippedPost = false;
  } else wordObj.lastSkippedPost = true;
}

/**
 * Capitalizes the first letter of a string.
 *
 * @param {string} str A string to capitalize
 * @returns {string} The provided string with the first letter capitalized.
 */
function capFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Gets a derivative of a number by repeatedly dividing it by 7 and adding the
 * remainders together.  It's useful to base decisions on a derivative rather
 * than the wordObj's current numeric, as it avoids making the same decisions
 * around the same phonetics.
 *
 * @param {number} num A number from which a derivative should be calculated
 * @returns {number} The derivative.
 */
function getDerivative(num) {
  var derivative = 1;
  while (num !== 0) {
    derivative += num % 7;
    num = Math.floor(num / 7);
  }
  return derivative;
}

/**
 * Combines the option defaults with the provided overrides.  Available
 * options are:
 *  - syllables: The number of syllables to put in the resulting word.
 *          Default is 3.
 *  - seed: A string or number with which to seed the generator.  Using the
 *          same seed (with the same other options) will coerce the generator
 *          into producing the same word.  Default is random.
 *  - phoneticSimplicity: The greater this number, the simpler the phonetics.
 *          For example, 1 might produce 'str' while 5 might produce 's' for
 *          the same syllable.  Minimum is 1, default is 5.
 *  - compoundSimplicity: The greater this number, the less likely the
 *          resulting word will sound "compound", such as "ripkuth" instead of
 *          "riputh".  Minimum is 1, default is 5.
 *  - capFirst: true to capitalize the first letter of the word; all lowercase
 *          otherwise.  Default is true.
 *
 * @param {{}} overrides A set of options and values with which to override
 *      the defaults.
 * @returns {{syllables, seed, phoneticSimplicity, compoundSimplicity, capFirst}}
 *      An options object.
 */
function getOptions(overrides) {
  var options = {};
  overrides = overrides || {};
  options.syllables = overrides.syllables || 3;
  options.seed = overrides.seed || crypto.randomBytes(16).toString("base64");
  options.phoneticSimplicity = overrides.phoneticSimplicity ? Math.max(overrides.phoneticSimplicity, 1) : 5;
  options.compoundSimplicity = overrides.compoundSimplicity ? Math.max(overrides.compoundSimplicity, 1) : 5;
  options.capFirst = overrides.hasOwnProperty("capFirst") ? overrides.capFirst : true;
  return options;
}

/**
 * Gets the next pseudo-random phonetic from a given phonetic set,
 * intelligently determining whether to include "complex" phonetics in that
 * set based on the options.phoneticSimplicity.
 *
 * @param {Array} phoneticSet The array of phonetics from which to choose
 * @param {number} simpleCap The number of 'simple' phonetics at the beginning
 *      of the phoneticSet
 * @param {{word, numeric, lastSkippedPre, lastSkippedPost, opts}} wordObj The
 *      wordObj for which the phonetic is being chosen
 * @param {boolean} [forceSimple] true to force a simple phonetic to be
 *      chosen; otherwise, the function will choose whether to include complex
 *      phonetics based on the derivative of wordObj.numeric.
 * @returns {string} The chosen phonetic.
 */
function getNextPhonetic(phoneticSet, simpleCap, wordObj, forceSimple) {
  var deriv = getDerivative(wordObj.numeric),
    simple = (wordObj.numeric + deriv) % wordObj.opts.phoneticSimplicity > 0,
    cap = simple || forceSimple ? simpleCap : phoneticSet.length,
    phonetic = phoneticSet[wordObj.numeric % cap];
  wordObj.numeric = getNumericHash(wordObj.numeric + wordObj.word);
  return phonetic;
}

/**
 * Generates a numeric hash based on the input data.  The hash is an md5, with
 * each block of 32 bits converted to an integer and added together.
 *
 * @param {string|number} data The string or number to be hashed.
 * @returns {number}
 */
function getNumericHash(data) {
  return md5(data);
}

/**
 * Applies post-processing to a word after it has already been generated.  In
 * this phase, the REPLACEMENTS are executed, applying language intelligence
 * that can make generated words more pronounceable.  The first letter is
 * also capitalized.
 *
 * @param {{word, numeric, lastSkippedPre, lastSkippedPost, opts}} wordObj The
 *      word object to be processed.
 * @returns {string} The processed word.
 */
function postProcess(wordObj) {
  var regex;
  for (var i in REPLACEMENTS) {
    if (REPLACEMENTS.hasOwnProperty(i)) {
      regex = new RegExp(i);
      wordObj.word = wordObj.word.replace(regex, REPLACEMENTS[i]);
    }
  }
  if (wordObj.opts.capFirst) return capFirst(wordObj.word);
  return wordObj.word;
}

function md5(str) {
  const rotL = (lVal, iShift) => (lVal << iShift) | (lVal >>> (32 - iShift));

  const uInt = (lX, lY) => {
    var lX4, lY4, lX8, lY8, lRes;
    lX8 = lX & 0x80000000;
    lY8 = lY & 0x80000000;
    lX4 = lX & 0x40000000;
    lY4 = lY & 0x40000000;
    lRes = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) return lRes ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4) {
      if (lRes & 0x40000000) return lRes ^ 0xc0000000 ^ lX8 ^ lY8;
      return lRes ^ 0x40000000 ^ lX8 ^ lY8;
    }
    return lRes ^ lX8 ^ lY8;
  };

  const F = (x, y, z) => (x & y) | (~x & z);
  const G = (x, y, z) => (x & z) | (y & ~z);
  const H = (x, y, z) => x ^ y ^ z;
  const I = (x, y, z) => y ^ (x | ~z);

  const FF = (a, b, c, d, x, s, ac) => {
    a = uInt(a, uInt(uInt(F(b, c, d), x), ac));
    return uInt(rotL(a, s), b);
  };
  const GG = (a, b, c, d, x, s, ac) => {
    a = uInt(a, uInt(uInt(G(b, c, d), x), ac));
    return uInt(rotL(a, s), b);
  };
  const HH = (a, b, c, d, x, s, ac) => {
    a = uInt(a, uInt(uInt(H(b, c, d), x), ac));
    return uInt(rotL(a, s), b);
  };
  const II = (a, b, c, d, x, s, ac) => {
    a = uInt(a, uInt(uInt(I(b, c, d), x), ac));
    return uInt(rotL(a, s), b);
  };

  const w2arr = (str) => {
    var lWC;
    var lMsgLng = str.length;
    var lWC1 = lMsgLng + 8;
    var lWC2 = (lWC1 - (lWC1 % 64)) / 64;
    var lWCTot = (lWC2 + 1) * 16;
    var lWordArr = Array(lWCTot - 1);
    var lBytePos = 0;
    var lByteCount = 0;
    while (lByteCount < lMsgLng) {
      lWC = (lByteCount - (lByteCount % 4)) / 4;
      lBytePos = (lByteCount % 4) * 8;
      lWordArr[lWC] = lWordArr[lWC] | (str.charCodeAt(lByteCount) << lBytePos);
      lByteCount++;
    }
    lWC = (lByteCount - (lByteCount % 4)) / 4;
    lBytePos = (lByteCount % 4) * 8;
    lWordArr[lWC] = lWordArr[lWC] | (0x80 << lBytePos);
    lWordArr[lWCTot - 2] = lMsgLng << 3;
    lWordArr[lWCTot - 1] = lMsgLng >>> 29;
    return lWordArr;
  };

  const utf8enc = (str) => {
    str = str.replace(/\r\n/g, "\n");
    var utftext = "";

    for (var n = 0; n < str.length; n++) {
      var c = str.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }

    return utftext;
  };

  var x = [];
  var k, AA, BB, CC, DD, a, b, c, d;
  var S11 = 7;
  var S12 = 12;
  var S13 = 17;
  var S14 = 22;
  var S21 = 5;
  var S22 = 9;
  var S23 = 14;
  var S24 = 20;
  var S31 = 4;
  var S32 = 11;
  var S33 = 16;
  var S34 = 23;
  var S41 = 6;
  var S42 = 10;
  var S43 = 15;
  var S44 = 21;

  str = utf8enc(str);

  x = w2arr(str);

  a = 0x67452302;
  b = 0xefcdab89;
  c = 0x88badcfe;
  d = 0x12345678;

  for (k = 0; k < x.length; k += 16) {
    AA = a;
    BB = b;
    CC = c;
    DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xd76aa478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070db);
    b = FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
    a = FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787c62a);
    c = FF(c, d, a, b, x[k + 6], S13, 0xa8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xfd469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098d8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
    c = FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895cd7be);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6b901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xfd987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xa679438e);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49b40821);
    a = GG(a, b, c, d, x[k + 1], S21, 0xf61e2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xc040b340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265e5a51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
    a = GG(a, b, c, d, x[k + 5], S21, 0xd62f105d);
    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xc33707d6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455a14ed);
    a = GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676f02d9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);
    a = HH(a, b, c, d, x[k + 5], S31, 0xfffa3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771f681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xfde5380c);
    a = HH(a, b, c, d, x[k + 1], S31, 0xa4beea44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
    c = HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x4881d05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xd9d4d039);
    d = HH(d, a, b, c, x[k + 12], S32, 0xe6db99e5);
    c = HH(c, d, a, b, x[k + 15], S33, 0x1fa27cf8);
    b = HH(b, c, d, a, x[k + 2], S34, 0xc4ac5665);
    a = II(a, b, c, d, x[k + 0], S41, 0xf4292244);
    d = II(d, a, b, c, x[k + 7], S42, 0x432aff97);
    c = II(c, d, a, b, x[k + 14], S43, 0xab9423a7);
    b = II(b, c, d, a, x[k + 5], S44, 0xfc93a039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655b59c3);
    d = II(d, a, b, c, x[k + 3], S42, 0x8f0ccc92);
    c = II(c, d, a, b, x[k + 10], S43, 0xffeff47d);
    b = II(b, c, d, a, x[k + 1], S44, 0x85845dd1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6fa87e4f);
    d = II(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0);
    c = II(c, d, a, b, x[k + 6], S43, 0xa3014314);
    b = II(b, c, d, a, x[k + 13], S44, 0x4e0811a1);
    a = II(a, b, c, d, x[k + 4], S41, 0xf7537e82);
    d = II(d, a, b, c, x[k + 11], S42, 0xbd3af235);
    c = II(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb);
    b = II(b, c, d, a, x[k + 9], S44, 0xeb86d391);
    a = uInt(a, AA);
    b = uInt(b, BB);
    c = uInt(c, CC);
    d = uInt(d, DD);
  }

  return a > 0 ? a : -a;
}

/**
 * Generates a new word based on the given options.  For available options,
 * see getOptions.
 *
 * @param {*} [options] A collection of options to control the word generator.
 * @returns {string} A generated word.
 */
export default function phonetic(options) {
  options = getOptions(options);
  var syllables = options.syllables,
    wordObj = {
      numeric: getNumericHash(options.seed),
      lastSkippedPost: false,
      word: "",
      opts: options,
    };
  while (syllables--) addSyllable(wordObj);
  return postProcess(wordObj);
}
