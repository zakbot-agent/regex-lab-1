/** Regex matcher — find matches with positions and groups */

export interface MatchResult {
  match: string;
  index: number;
  end: number;
  groups: GroupInfo[];
}

export interface GroupInfo {
  index: number;
  value: string;
  name?: string;
}

export function findMatches(
  pattern: string,
  text: string,
  flags: string = "g"
): MatchResult[] {
  // Ensure 'g' flag for findAll behavior
  const effectiveFlags = flags.includes("g") ? flags : flags + "g";
  const regex = new RegExp(pattern, effectiveFlags);
  const results: MatchResult[] = [];

  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    const groups: GroupInfo[] = [];
    for (let i = 1; i < m.length; i++) {
      if (m[i] !== undefined) {
        groups.push({ index: i, value: m[i] });
      }
    }

    // Named groups
    if (m.groups) {
      for (const [name, value] of Object.entries(m.groups)) {
        const existing = groups.find((g) => g.value === value);
        if (existing) existing.name = name;
      }
    }

    results.push({
      match: m[0],
      index: m.index,
      end: m.index + m[0].length,
      groups,
    });

    // Prevent infinite loop on zero-length matches
    if (m[0].length === 0) regex.lastIndex++;
  }

  return results;
}

export function findFirstMatch(
  pattern: string,
  text: string,
  flags: string = ""
): MatchResult | null {
  const results = findMatches(pattern, text, flags.replace("g", "") + "g");
  return results[0] ?? null;
}
