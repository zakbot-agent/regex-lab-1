#!/usr/bin/env node
/** regex-lab — CLI entry point */

import { findMatches } from "./matcher";
import { explainRegex, formatExplanation } from "./explainer";
import { replaceMatches } from "./replacer";
import { getPattern, listPatterns } from "./common";
import { startServer } from "./server";
import {
  highlightMatches,
  formatMatchDetails,
  formatReplaceResult,
  formatExplainOutput,
  formatCommonPattern,
  formatCommonList,
  matchesToJson,
  replaceToJson,
  explainToJson,
  commonToJson,
} from "./formatter";

interface ParsedArgs {
  positional: string[];
  flags: Set<string>;
  options: Record<string, string>;
}

function parseArgs(argv: string[]): ParsedArgs {
  const positional: string[] = [];
  const flags = new Set<string>();
  const options: Record<string, string> = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--all" || arg === "--json" || arg === "--serve" || arg === "--help") {
      flags.add(arg.slice(2));
    } else if (arg === "--lang" && i + 1 < argv.length) {
      options["lang"] = argv[++i];
    } else if (arg === "--port" && i + 1 < argv.length) {
      options["port"] = argv[++i];
    } else if (arg === "--common") {
      flags.add("common");
      // Next arg might be a pattern name (if not a flag)
      if (i + 1 < argv.length && !argv[i + 1].startsWith("-")) {
        options["common"] = argv[++i];
      }
    } else if (arg === "--flags" && i + 1 < argv.length) {
      options["regexFlags"] = argv[++i];
    } else {
      positional.push(arg);
    }
  }

  return { positional, flags, options };
}

function showUsage(): void {
  console.log(`
\x1b[1m\x1b[36mregex-lab\x1b[0m — Regex tester with explanations

\x1b[1mUsage:\x1b[0m
  regex-lab <pattern> <text>              Test regex, show first match
  regex-lab <pattern> <text> --all        Show all matches with positions
  regex-lab explain <pattern>             Explain regex in plain text
  regex-lab explain <pattern> --lang fr   Explain in French
  regex-lab replace <pattern> <repl> <text>  Replace matches
  regex-lab --common                      List all common patterns
  regex-lab --common <name>               Show a specific common pattern
  regex-lab --serve                       Start web UI (port 3464)

\x1b[1mOptions:\x1b[0m
  --all          Show all matches
  --json         Output as JSON
  --lang <code>  Language for explanations (en, fr)
  --flags <f>    Regex flags (g, i, m, s)
  --port <n>     Web server port (default: 3464)
  --serve        Start web UI
  --help         Show this help
`);
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));

  // Help
  if (args.flags.has("help") || (args.positional.length === 0 && args.flags.size === 0)) {
    showUsage();
    return;
  }

  const isJson = args.flags.has("json");

  // --serve
  if (args.flags.has("serve")) {
    const port = args.options["port"] ? parseInt(args.options["port"], 10) : 3464;
    startServer(port);
    return;
  }

  // --common
  if (args.flags.has("common")) {
    const name = args.options["common"];
    if (name) {
      const p = getPattern(name);
      if (!p) {
        console.error(`Unknown pattern: ${name}`);
        process.exit(1);
      }
      if (isJson) {
        console.log(commonToJson(p));
      } else {
        console.log(formatCommonPattern(p.name, p.pattern, p.description, p.examples));
      }
    } else {
      const patterns = listPatterns();
      if (isJson) {
        console.log(commonToJson(patterns));
      } else {
        console.log(formatCommonList(patterns));
      }
    }
    return;
  }

  const command = args.positional[0];

  // explain
  if (command === "explain") {
    const pattern = args.positional[1];
    if (!pattern) {
      console.error("Usage: regex-lab explain <pattern> [--lang fr]");
      process.exit(1);
    }
    const lang = args.options["lang"] || "en";
    const tokens = explainRegex(pattern, lang);

    if (isJson) {
      console.log(explainToJson(pattern, tokens));
    } else {
      const explanation = formatExplanation(tokens);
      console.log(formatExplainOutput(explanation, pattern));
    }
    return;
  }

  // replace
  if (command === "replace") {
    const [, pattern, replacement, text] = args.positional;
    if (!pattern || replacement === undefined || !text) {
      console.error("Usage: regex-lab replace <pattern> <replacement> <text>");
      process.exit(1);
    }
    const flags = args.options["regexFlags"] || "g";
    const result = replaceMatches(pattern, replacement, text, flags);

    if (isJson) {
      console.log(replaceToJson(result));
    } else {
      console.log(formatReplaceResult(result));
    }
    return;
  }

  // Default: match
  const pattern = args.positional[0];
  const text = args.positional[1];

  if (!pattern || !text) {
    console.error("Usage: regex-lab <pattern> <text> [--all]");
    process.exit(1);
  }

  const flags = args.options["regexFlags"] || "g";

  try {
    const matches = findMatches(pattern, text, flags);

    if (isJson) {
      console.log(matchesToJson(matches));
    } else {
      console.log(highlightMatches(text, matches));
      console.log("");
      console.log(formatMatchDetails(matches, args.flags.has("all")));
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`\x1b[31mInvalid regex: ${msg}\x1b[0m`);
    process.exit(1);
  }
}

main();
