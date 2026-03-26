# Awesome ClaudeMD

**A team collaboration framework for managing and synchronizing AI development protocols (`CLAUDE.md`) across projects.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub Actions](https://img.shields.io/badge/CI-GitHub%20Actions-blue)](/.github/workflows/integrate-tips.yml)
[![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension%20v1.0.0-007ACC)](claude-code-chatinwindows/)

---

## Overview

`CLAUDE.md` files define how Claude Code behaves in a project — coding standards, execution flows, testing rules, and team conventions. Maintaining them manually is painful: you copy-paste between projects, versions drift across teammates, and hard-won lessons never get shared.

**Awesome ClaudeMD** solves this with three mechanisms:

1. **One-time install, permanent hot updates** — a symlink keeps every project pointing at the latest protocol automatically
2. **Automated team experience integration** — teammates submit `tips/*.md` files; GitHub Actions + Claude AI synthesizes them into the shared protocol
3. **Two-layer protocol design** — a stable execution flow layer and an accumulating constraints layer that never conflict

---

## Features

- `/asinit` slash command for Claude Code — auto-pulls latest protocol and writes/updates `CLAUDE.md` in any project
- **Two execution modes**: Strict mode (spec-driven, 5-step flow with Gemini review) and General mode (4-step flow)
- **Tips system** — community experience sharing with named contribution files (`tips/<topic>-<author>.md`)
- **GitHub Actions automation** — triggers on `tips/` changes, runs Claude Sonnet analysis via AWS Bedrock, auto-commits integrated results
- **VS Code extension** (`claudemd-manager`) — visual dashboard for protocol management, Tips submission, Git sync, and AI integration
- **Reusable templates** — battle-tested `CLAUDE.md` templates in `templates/`
- **Two-layer protocol architecture** with `<!-- ASINIT START/END -->` markers, preserving custom project content

---

## Quick Start

### macOS / Linux

```bash
# Clone once
git clone https://github.com/Arxchibobo/Awesome_ClaudeMD.git ~/Awesome_ClaudeMD

# Create symlink (one-time setup)
mkdir -p ~/.claude/commands
ln -sf ~/Awesome_ClaudeMD/asinit_AwosomeCLAUDE.md ~/.claude/commands/asinit.md
```

### Windows (PowerShell as Administrator)

```powershell
git clone https://github.com/Arxchibobo/Awesome_ClaudeMD.git "$env:USERPROFILE\Awesome_ClaudeMD"
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\commands"
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.claude\commands\asinit.md" -Target "$env:USERPROFILE\Awesome_ClaudeMD\asinit_AwosomeCLAUDE.md" -Force
```

### Usage

In any project with Claude Code:

```
/asinit
```

This command automatically pulls the latest protocol and writes (or updates) `CLAUDE.md` in your project, preserving any project-specific content outside the `<!-- ASINIT START/END -->` markers.

---

## How the `/asinit` Command Works

```
/asinit
  ├── Step 1: git pull ~/Awesome_ClaudeMD  (auto-update)
  └── Step 2: Write CLAUDE.md
        ├── If missing → create new file
        ├── If exists, no markers → prepend protocol block
        └── If exists with markers → update only the marked block
```

The protocol block contains two layers:

| Layer | Content | Stability |
|-------|---------|-----------|
| Execution Flow | Strict mode / General mode standard processes | Fixed |
| Constraint Patches | Testing rules, commit conventions, team tips | Continuously updated |

---

## Contributing Tips

Share your hard-won lessons with the team:

```bash
# 1. Pull latest
git pull origin main

# 2. Create a tip file (naming: topic-yourname.md)
cp tips/_template.md tips/null-check-yourname.md

# 3. Fill in the template, then commit
git add tips/null-check-yourname.md
git commit -m "tips: add null check pattern"
git push
```

After pushing, GitHub Actions automatically triggers Claude AI to analyze and integrate the tip into the shared protocol. No manual review required.

**Tip file template:**

```markdown
## Problem
[Describe the issue that caused bugs or confusion]

## Solution
[How Claude should handle this situation]

## Example (optional)
[Concrete code example]
```

---

## Templates

The `templates/` directory provides verified `CLAUDE.md` templates for immediate use:

| Template | Best For |
|----------|---------|
| [`team-claude-v1.md`](templates/team-claude-v1.md) | Team collaboration projects |

```bash
# Copy to your project
cp templates/team-claude-v1.md /your/project/CLAUDE.md

# Customize placeholders (search for [YOUR_ )
```

See [`templates/README.md`](templates/README.md) for details.

---

## VS Code Extension

A companion VS Code extension (`claudemd-manager`) provides a graphical interface for all features.

**Install from VSIX:**

```bash
code --install-extension claude-code-chatinwindows/claudemd-manager-1.0.0.vsix
```

**Features:**
- Main dashboard — project status, repo sync state, Tips stats, commit history
- Tips manager — submit, view pending/integrated tips, archive
- One-click protocol sync and application
- AWS Bedrock integration for local AI-powered Tips synthesis

See [`INSTALL_GUIDE.md`](INSTALL_GUIDE.md) for full setup instructions.

---

## GitHub Actions Setup

For the automated Tips integration to work, add these secrets to your fork:

**Settings → Secrets → Actions:**

| Secret | Value |
|--------|-------|
| `AWS_ACCESS_KEY_ID` | Your AWS access key |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret key |

The workflow uses AWS Bedrock (Claude Sonnet) to analyze tips and update the protocol. AWS credentials are only required if you fork and run the automation yourself.

---

## Repository Structure

```
Awesome_ClaudeMD/
├── asinit_AwosomeCLAUDE.md        # Core protocol template (symlinked as /asinit)
├── CLAUDE.md                       # This repo's own AI development protocol
├── tips/                           # Community experience contributions
│   ├── _template.md               # Template for new tips
│   └── *.md                       # Individual tip files
├── templates/                      # Reusable CLAUDE.md templates
│   └── team-claude-v1.md
├── claude-code-chatinwindows/      # VS Code extension source + VSIX
│   ├── src/                       # TypeScript source (22 files)
│   ├── claudemd-manager-1.0.0.vsix
│   └── package.json
├── .github/
│   ├── workflows/integrate-tips.yml
│   └── scripts/integrate-tips.js
└── INSTALL_GUIDE.md
```

---

## Requirements

- **Claude Code** — for `/asinit` slash command usage
- **Git** — for cloning and symlink setup
- **Node.js 20+** — for VS Code extension development only
- **VS Code 1.85+** — for the extension
- **AWS account with Bedrock access** — only for automated Tips integration (optional)

---

## License

MIT
