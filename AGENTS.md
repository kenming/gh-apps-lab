# GH Apps Lab — Agent Instructions

This repository demonstrates remote-only, AI-assisted development of lightweight, browser-based apps.

## Scope
- Apps live under `apps/<app-name>/`; the root `site/` is the GitHub Pages landing page.
- Initial app: `apps/expense-tracker/`.
- Keep the apps independent and deploy them to `/<repo>/<app-name>/`.
- Do not introduce a backend, external database, API secrets, or persistent server without explicit approval.
- Prefer TypeScript, Vite, and Vitest for new apps unless requirements change.

## Workflow
1. Read relevant source files before editing.
2. Make a small change on a feature branch and open a pull request.
3. Validate with GitHub Actions CI before merging.
4. Deploy the `main` branch to GitHub Pages using the deploy workflow.
5. Keep README instructions and tests aligned with behavior.

## Data / privacy
Expense data and budget settings are stored only in browser LocalStorage. No authentication or cross-device synchronization is provided.

## Validation
From `apps/expense-tracker`: `npm install`, `npm run test`, `npm run build`.
GitHub Actions runs these in an Ubuntu runner; Pages serves the generated static site.
