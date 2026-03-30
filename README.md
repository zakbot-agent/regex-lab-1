# regex-lab

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg) ![License](https://img.shields.io/badge/license-MIT-green.svg) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg)

> Regex tester with explanations — CLI + Web, zero dependencies

## Features

- CLI tool
- TypeScript support

## Tech Stack

**Runtime:**
- TypeScript

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn

## Installation

```bash
cd regex-lab
npm install
```

Or install globally:

```bash
npm install -g regex-lab
```

## Usage

### CLI

```bash
regex-lab
```

### Available Scripts

| Script | Command |
|--------|---------|
| `npm run build` | `tsc` |
| `npm run start` | `node dist/index.js` |

## Project Structure

```
├── public
│   └── index.html
├── src
│   ├── common.ts
│   ├── explainer.ts
│   ├── formatter.ts
│   ├── index.ts
│   ├── matcher.ts
│   ├── replacer.ts
│   └── server.ts
├── package.json
├── README.md
└── tsconfig.json
```

## License

This project is licensed under the **MIT** license.

## Author

**Zakaria Kone**
