# GH Apps Lab

A collection of lightweight browser apps for demonstrating **ChatGPT + GitHub + GitHub Actions + GitHub Pages** cloud-only AI-assisted development, with no local workspace required.

## Apps

| App | Source | Published site |
| --- | --- | --- |
| 日常記帳 Expense Tracker | [apps/expense-tracker](apps/expense-tracker) | [Open Expense Tracker](https://kenming.github.io/gh-apps-lab/expense-tracker/) |

Features: create and delete expenses, monthly total, category totals, monthly budget and over-budget warning, plus expense-list category filtering (全部、餐飲、交通、購物、其他). Category filtering only affects the visible expense records and count; monthly totals, category statistics and budget calculations remain unchanged. Data is stored in the **current browser's LocalStorage** (no cloud sync).

## Cloud development workflow

1. Ask ChatGPT (with GitHub connector) to review or change the app through a branch/PR.
2. CI runs tests and compiles the app using GitHub Actions.
3. After merging to `main`, the deployment workflow publishes the static site to GitHub Pages.
4. Open the app in a browser. GitHub Actions is the build/test/deployment runner; the browser executes the app.

GitHub Pages must have **Settings → Pages → Build and deployment → Source: GitHub Actions** enabled.

## Repository structure

```text
.github/workflows/ci.yml       # Build and test
.github/workflows/deploy.yml   # Build and deploy to Pages
apps/expense-tracker/           # TypeScript + Vite + Vitest
site/index.html                # GitHub Pages launcher
AGENTS.md                      # Agent project rules
```

Optional local validation (not required for the cloud-only workflow):

```sh
cd apps/expense-tracker
npm install
npm run test
npm run build
```

This is a teaching demo, not a financial records service. Do not store sensitive personal financial information.
