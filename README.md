# TPS Traffic Report Automation

Automated daily submission of Toronto Police Service neighbourhood traffic complaints using [Playwright](https://playwright.dev/) and Microsoft Edge.

Built entirely by [Claude Code](https://claude.ai/claude-code) — from browser automation to scheduled task setup.

## What It Does

Fills and submits the [TPS Local Neighbourhood Traffic Issue or Concern](https://www.tps.ca/services/online-reporting/local-neighbourhood-traffic-issue-concern/) form automatically. The script:

- Navigates the multi-step form (Yourself → Incident → Narrative → Review → Submit)
- Uses today's date for the incident time window
- Skips Sundays
- Runs headless (no browser window)
- Logs output and captures error screenshots

## Prerequisites

- **Windows** with Microsoft Edge installed
- **Node.js** (v18+)
- **Playwright** (`npm install` handles this)

## Setup

1. Clone the repo:
   ```
   git clone https://github.com/adamkwhite/tps-traffic-report.git
   cd tps-traffic-report
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Copy the example config and fill in your details:
   ```
   copy config.example.json config.json
   ```
   Edit `config.json` with your name, email, phone, incident location, and narrative. This file is gitignored — your personal info stays local.

4. Test a single run:
   ```
   node submit-report.js
   ```

5. Schedule daily execution (Mon–Sat at 11am) — run as Administrator:
   ```
   setup-task.bat
   ```

## Files

| File | Description |
|------|-------------|
| `submit-report.js` | Main automation script |
| `config.example.json` | Template config — copy to `config.json` and fill in your details |
| `config.json` | Your personal config (gitignored) |
| `run.bat` | Wrapper for Task Scheduler (logs to `log.txt`) |
| `setup-task.bat` | Creates the Windows Scheduled Task |

## Configuration

All settings are in `config.json` (copied from `config.example.json`):

- **Personal info** — name, email, phone, gender, DOB
- **Incident location** — street number, name, type, city
- **Time window** — start/end hour for the reported incident
- **Narrative** — description of the traffic concern
- **Schedule** — runs Mon–Sat by default (Sundays skipped in code + Task Scheduler)

## Debugging

- Logs are written to `log.txt`
- Error screenshots are saved as `error-{timestamp}.png`
- Set `headless: false` in the script to watch the browser during testing

## How It Was Built

This entire project — the Playwright script, form field discovery, Task Scheduler setup, and this README — was built in a single session using Claude Code with the [Playwright MCP server](https://github.com/microsoft/playwright-mcp). Claude navigated the live form, identified field IDs, handled validation errors, and generated the automation script.
