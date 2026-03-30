/** Regex replacer — replace matches in text */

export interface ReplaceResult {
  original: string;
  replaced: string;
  count: number;
}

export function replaceMatches(
  pattern: string,
  replacement: string,
  text: string,
  flags: string = "g"
): ReplaceResult {
  const effectiveFlags = flags.includes("g") ? flags : flags + "g";
  const regex = new RegExp(pattern, effectiveFlags);

  let count = 0;
  const replaced = text.replace(regex, (...args) => {
    count++;
    // Support $1, $2, etc. in replacement — handled natively by String.replace
    return replacement;
  });

  return { original: text, replaced, count };
}
