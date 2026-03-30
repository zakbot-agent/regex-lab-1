/** CLI output formatter — colors and formatting, zero deps */

// ANSI color codes
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const RED = "\x1b[31m";
const MAGENTA = "\x1b[35m";
const BG_GREEN = "\x1b[42m";
const BG_YELLOW = "\x1b[43m";
const BG_CYAN = "\x1b[46m";
const BG_MAGENTA = "\x1b[45m";
const BLACK = "\x1b[30m";

const GROUP_COLORS = [BG_YELLOW, BG_CYAN, BG_MAGENTA];

import { MatchResult } from "./matcher";
import { ReplaceResult } from "./replacer";

export function highlightMatches(text: string, matches: MatchResult[]): string {
  if (matches.length === 0) return text;

  // Sort by index descending so we can insert from the end
  const sorted = [...matches].sort((a, b) => b.index - a.index);
  let result = text;

  for (const m of sorted) {
    const before = result.slice(0, m.index);
    const after = result.slice(m.end);
    result = before + BG_GREEN + BLACK + m.match + RESET + after;
  }

  return result;
}

export function formatMatchDetails(matches: MatchResult[], showAll: boolean): string {
  if (matches.length === 0) {
    return `${RED}No matches found.${RESET}`;
  }

  const lines: string[] = [];
  const list = showAll ? matches : [matches[0]];

  lines.push(`${BOLD}${GREEN}${matches.length} match${matches.length > 1 ? "es" : ""} found${RESET}`);
  lines.push("");

  for (let i = 0; i < list.length; i++) {
    const m = list[i];
    lines.push(
      `  ${CYAN}Match ${i + 1}:${RESET} "${GREEN}${m.match}${RESET}" ` +
        `${DIM}at index ${m.index}-${m.end}${RESET}`
    );

    if (m.groups.length > 0) {
      for (const g of m.groups) {
        const colorIdx = (g.index - 1) % GROUP_COLORS.length;
        const bg = GROUP_COLORS[colorIdx];
        const label = g.name ? `Group ${g.index} (${g.name})` : `Group ${g.index}`;
        lines.push(`    ${bg}${BLACK}${label}:${RESET} "${g.value}"`);
      }
    }
  }

  if (!showAll && matches.length > 1) {
    lines.push(`\n  ${DIM}(${matches.length - 1} more matches — use --all to show all)${RESET}`);
  }

  return lines.join("\n");
}

export function formatReplaceResult(result: ReplaceResult): string {
  const lines: string[] = [];
  lines.push(`${BOLD}${CYAN}Replace result${RESET}`);
  lines.push(`  ${DIM}Replacements:${RESET} ${result.count}`);
  lines.push(`  ${DIM}Original:${RESET}  ${result.original}`);
  lines.push(`  ${DIM}Result:${RESET}    ${GREEN}${result.replaced}${RESET}`);
  return lines.join("\n");
}

export function formatExplainOutput(explanation: string, pattern: string): string {
  const lines: string[] = [];
  lines.push(`${BOLD}${CYAN}Regex explanation:${RESET} ${YELLOW}/${pattern}/${RESET}`);
  lines.push("");
  lines.push(explanation);
  return lines.join("\n");
}

export function formatCommonPattern(
  name: string,
  pattern: string,
  description: string,
  examples: string[]
): string {
  const lines: string[] = [];
  lines.push(`${BOLD}${CYAN}${name}${RESET} — ${description}`);
  lines.push(`  ${YELLOW}/${pattern}/${RESET}`);
  lines.push(`  ${DIM}Examples: ${examples.join(", ")}${RESET}`);
  return lines.join("\n");
}

export function formatCommonList(
  patterns: { name: string; description: string }[]
): string {
  const lines: string[] = [];
  lines.push(`${BOLD}${CYAN}Available common patterns:${RESET}\n`);
  const maxLen = Math.max(...patterns.map((p) => p.name.length));
  for (const p of patterns) {
    lines.push(`  ${GREEN}${p.name.padEnd(maxLen)}${RESET}  ${p.description}`);
  }
  return lines.join("\n");
}

// JSON output helpers (no colors)
export function matchesToJson(matches: MatchResult[]): string {
  return JSON.stringify(
    {
      count: matches.length,
      matches: matches.map((m) => ({
        match: m.match,
        index: m.index,
        end: m.end,
        groups: m.groups,
      })),
    },
    null,
    2
  );
}

export function replaceToJson(result: ReplaceResult): string {
  return JSON.stringify(result, null, 2);
}

export function explainToJson(
  pattern: string,
  tokens: { raw: string; explanation: string }[]
): string {
  return JSON.stringify({ pattern, tokens }, null, 2);
}

export function commonToJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}
