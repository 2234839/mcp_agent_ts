# mcp_agent_ts

[Chinese Document](./README_zh.md) [English Document](./README.md)

This is a tool I created to simplify the creation of agents based on mcp.

## Features

- [x] Based on mcp
- [x] Automatically calls resources provided by mcp
- [x] Markdown file translation CLI tool
- [ ] Based on openai to connect to open models

## Translation CLI Tool

The `mcp_agent_ts-translate-md` command provides translation for Markdown files while preserving the format:

### Installation
```bash
pnpm install -g mcp_agent_ts
```

### Usage
```bash
mcp_agent_ts-translate-md translate -i <input.md> -o <output.md> -l <language>
```

### Example
```bash
# Translate to Chinese
mcp_agent_ts-translate-md translate -i README_zh.md -o README.md -l "English"
```

### Features
- Preserves Markdown syntax
- Uses the GLM-4-Flash AI model
- Simple command-line interface