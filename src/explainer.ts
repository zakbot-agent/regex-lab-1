/** Regex explainer — tokenizes and explains regex patterns in plain text */

interface Token {
  raw: string;
  explanation: string;
}

interface Translations {
  [key: string]: { [lang: string]: string };
}

const TRANSLATIONS: Translations = {
  any_char: { en: "Any character", fr: "N'importe quel caractere" },
  digit: { en: "Any digit (0-9)", fr: "N'importe quel chiffre (0-9)" },
  non_digit: { en: "Any non-digit", fr: "Tout sauf un chiffre" },
  word_char: {
    en: "Any word character (a-z, A-Z, 0-9, _)",
    fr: "Caractere de mot (a-z, A-Z, 0-9, _)",
  },
  non_word: { en: "Any non-word character", fr: "Tout sauf un caractere de mot" },
  whitespace: {
    en: "Any whitespace (space, tab, newline)",
    fr: "Espace blanc (espace, tab, retour a la ligne)",
  },
  non_whitespace: { en: "Any non-whitespace", fr: "Tout sauf espace blanc" },
  word_boundary: { en: "Word boundary", fr: "Limite de mot" },
  non_word_boundary: { en: "Non-word boundary", fr: "Pas une limite de mot" },
  start: { en: "Start of string", fr: "Debut de chaine" },
  end: { en: "End of string", fr: "Fin de chaine" },
  one_or_more: { en: "One or more", fr: "Un ou plus" },
  zero_or_more: { en: "Zero or more", fr: "Zero ou plus" },
  optional: { en: "Optional (zero or one)", fr: "Optionnel (zero ou un)" },
  or: { en: "OR", fr: "OU" },
  capture_group: { en: "Capture group", fr: "Groupe de capture" },
  non_capture_group: { en: "Non-capturing group", fr: "Groupe non-capturant" },
  lookahead: { en: "Positive lookahead", fr: "Assertion avant positive" },
  neg_lookahead: { en: "Negative lookahead", fr: "Assertion avant negative" },
  lookbehind: { en: "Positive lookbehind", fr: "Assertion arriere positive" },
  neg_lookbehind: { en: "Negative lookbehind", fr: "Assertion arriere negative" },
  lazy: { en: "Lazy (as few as possible)", fr: "Paresseux (le moins possible)" },
  char_class: { en: "Character class", fr: "Classe de caracteres" },
  neg_char_class: { en: "Negated character class (none of)", fr: "Classe inversee (aucun de)" },
  range: { en: "Range", fr: "Plage" },
  exact_n: { en: "Exactly %n times", fr: "Exactement %n fois" },
  at_least_n: { en: "At least %n times", fr: "Au moins %n fois" },
  between_n_m: { en: "Between %n and %m times", fr: "Entre %n et %m fois" },
  literal: { en: "Literal", fr: "Litteral" },
  escaped: { en: "Escaped", fr: "Echappe" },
  backreference: { en: "Backreference to group %n", fr: "Reference arriere au groupe %n" },
  newline: { en: "Newline", fr: "Retour a la ligne" },
  tab: { en: "Tab", fr: "Tabulation" },
  carriage_return: { en: "Carriage return", fr: "Retour chariot" },
};

function t(key: string, lang: string, replacements?: Record<string, string>): string {
  const entry = TRANSLATIONS[key];
  let text = entry?.[lang] ?? entry?.["en"] ?? key;
  if (replacements) {
    for (const [k, v] of Object.entries(replacements)) {
      text = text.replace(`%${k}`, v);
    }
  }
  return text;
}

function parseCharClass(pattern: string, start: number, lang: string): { token: Token; end: number } {
  let i = start + 1; // skip [
  let negated = false;
  let content = "";

  if (i < pattern.length && pattern[i] === "^") {
    negated = true;
    i++;
  }

  // first ] after ^ or [ is literal
  if (i < pattern.length && pattern[i] === "]") {
    content += "]";
    i++;
  }

  while (i < pattern.length && pattern[i] !== "]") {
    content += pattern[i];
    if (pattern[i] === "\\" && i + 1 < pattern.length) {
      i++;
      content += pattern[i];
    }
    i++;
  }

  const raw = pattern.slice(start, i + 1);
  const label = negated ? t("neg_char_class", lang) : t("char_class", lang);
  const explained = explainCharClassContent(content, lang);
  return {
    token: { raw, explanation: `${label}: ${explained}` },
    end: i + 1,
  };
}

function explainCharClassContent(content: string, lang: string): string {
  const parts: string[] = [];
  let i = 0;
  while (i < content.length) {
    if (content[i] === "\\" && i + 1 < content.length) {
      const esc = content[i + 1];
      if (esc === "d") parts.push(t("digit", lang));
      else if (esc === "w") parts.push(t("word_char", lang));
      else if (esc === "s") parts.push(t("whitespace", lang));
      else parts.push(`'${esc}'`);
      i += 2;
    } else if (i + 2 < content.length && content[i + 1] === "-") {
      parts.push(`${t("range", lang)} '${content[i]}'-'${content[i + 2]}'`);
      i += 3;
    } else {
      parts.push(`'${content[i]}'`);
      i++;
    }
  }
  return parts.join(", ");
}

function parseQuantifier(
  pattern: string,
  start: number,
  lang: string
): { token: Token; end: number } | null {
  if (start >= pattern.length || pattern[start] !== "{") return null;
  const close = pattern.indexOf("}", start);
  if (close === -1) return null;

  const inner = pattern.slice(start + 1, close);
  const raw = pattern.slice(start, close + 1);

  if (/^\d+$/.test(inner)) {
    return {
      token: { raw, explanation: t("exact_n", lang, { n: inner }) },
      end: close + 1,
    };
  }
  const rangeMatch = inner.match(/^(\d+),(\d*)$/);
  if (rangeMatch) {
    const [, n, m] = rangeMatch;
    if (m === "") {
      return {
        token: { raw, explanation: t("at_least_n", lang, { n }) },
        end: close + 1,
      };
    }
    return {
      token: { raw, explanation: t("between_n_m", lang, { n, m }) },
      end: close + 1,
    };
  }
  return null;
}

export function explainRegex(pattern: string, lang: string = "en"): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < pattern.length) {
    const ch = pattern[i];

    // Escaped sequences
    if (ch === "\\" && i + 1 < pattern.length) {
      const next = pattern[i + 1];
      const map: Record<string, string> = {
        d: "digit",
        D: "non_digit",
        w: "word_char",
        W: "non_word",
        s: "whitespace",
        S: "non_whitespace",
        b: "word_boundary",
        B: "non_word_boundary",
        n: "newline",
        t: "tab",
        r: "carriage_return",
      };

      if (map[next]) {
        tokens.push({ raw: `\\${next}`, explanation: t(map[next], lang) });
        i += 2;
        continue;
      }

      // Backreference
      if (/\d/.test(next)) {
        tokens.push({
          raw: `\\${next}`,
          explanation: t("backreference", lang, { n: next }),
        });
        i += 2;
        continue;
      }

      // Escaped literal
      tokens.push({
        raw: `\\${next}`,
        explanation: `${t("escaped", lang)} '${next}'`,
      });
      i += 2;
      continue;
    }

    // Character class
    if (ch === "[") {
      const result = parseCharClass(pattern, i, lang);
      tokens.push(result.token);
      i = result.end;
      continue;
    }

    // Groups
    if (ch === "(") {
      if (pattern.slice(i, i + 3) === "(?:") {
        tokens.push({ raw: "(?:", explanation: t("non_capture_group", lang) + " (" });
        i += 3;
        continue;
      }
      if (pattern.slice(i, i + 3) === "(?=") {
        tokens.push({ raw: "(?=", explanation: t("lookahead", lang) + " (" });
        i += 3;
        continue;
      }
      if (pattern.slice(i, i + 3) === "(?!") {
        tokens.push({ raw: "(?!", explanation: t("neg_lookahead", lang) + " (" });
        i += 3;
        continue;
      }
      if (pattern.slice(i, i + 4) === "(?<=") {
        tokens.push({ raw: "(?<=", explanation: t("lookbehind", lang) + " (" });
        i += 4;
        continue;
      }
      if (pattern.slice(i, i + 4) === "(?<!") {
        tokens.push({ raw: "(?<!", explanation: t("neg_lookbehind", lang) + " (" });
        i += 4;
        continue;
      }
      tokens.push({ raw: "(", explanation: t("capture_group", lang) + " (" });
      i++;
      continue;
    }

    if (ch === ")") {
      tokens.push({ raw: ")", explanation: ")" });
      i++;
      continue;
    }

    // Quantifiers
    if (ch === "+") {
      const lazy = i + 1 < pattern.length && pattern[i + 1] === "?";
      const suffix = lazy ? " — " + t("lazy", lang) : "";
      tokens.push({ raw: lazy ? "+?" : "+", explanation: t("one_or_more", lang) + suffix });
      i += lazy ? 2 : 1;
      continue;
    }

    if (ch === "*") {
      const lazy = i + 1 < pattern.length && pattern[i + 1] === "?";
      const suffix = lazy ? " — " + t("lazy", lang) : "";
      tokens.push({ raw: lazy ? "*?" : "*", explanation: t("zero_or_more", lang) + suffix });
      i += lazy ? 2 : 1;
      continue;
    }

    if (ch === "?") {
      tokens.push({ raw: "?", explanation: t("optional", lang) });
      i++;
      continue;
    }

    if (ch === "{") {
      const result = parseQuantifier(pattern, i, lang);
      if (result) {
        // Check lazy
        if (result.end < pattern.length && pattern[result.end] === "?") {
          result.token.raw += "?";
          result.token.explanation += " — " + t("lazy", lang);
          result.end++;
        }
        tokens.push(result.token);
        i = result.end;
        continue;
      }
    }

    // Anchors and special
    if (ch === "^") {
      tokens.push({ raw: "^", explanation: t("start", lang) });
      i++;
      continue;
    }

    if (ch === "$") {
      tokens.push({ raw: "$", explanation: t("end", lang) });
      i++;
      continue;
    }

    if (ch === ".") {
      tokens.push({ raw: ".", explanation: t("any_char", lang) });
      i++;
      continue;
    }

    if (ch === "|") {
      tokens.push({ raw: "|", explanation: t("or", lang) });
      i++;
      continue;
    }

    // Literal character
    tokens.push({ raw: ch, explanation: `${t("literal", lang)} '${ch}'` });
    i++;
  }

  return tokens;
}

export function formatExplanation(tokens: Token[]): string {
  const lines: string[] = [];
  let indent = 0;

  for (const token of tokens) {
    if (token.raw === ")") {
      indent = Math.max(0, indent - 1);
      lines.push(`${"  ".repeat(indent)}${token.raw}  =>  ${token.explanation}`);
      continue;
    }

    lines.push(`${"  ".repeat(indent)}${token.raw}  =>  ${token.explanation}`);

    if (token.explanation.endsWith("(")) {
      indent++;
    }
  }

  return lines.join("\n");
}
