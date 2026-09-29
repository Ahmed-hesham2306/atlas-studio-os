# Atlas Studio OS

A detailed React + TypeScript front-end portfolio project by Ahmed Hesham: a studio operations workspace for projects, tasks, clients, invoices, and reporting. All businesses, people, invoices, and metrics are fictional sample data.

## Run and build

Requires Node.js 24 and npm.

```sh
npm ci
npm run build
npm test
```

Open `dist/atlas.html` in a modern browser, or serve `dist` with a static server. The build is a single self-contained HTML file with locally bundled React, React DOM, Lucide icons, and CSS. No remote scripts, fonts, APIs, or secrets are required. In the portfolio workspace the build also copies the app into `../site/dist/assets/demos/atlas.html`; when working on the downloaded source alone, the standalone `dist/atlas.html` is the result to use. The portfolio links assume the app is hosted at Ahmed’s portfolio domain and can be adjusted for another host.

## The product

1. **Overview:** calculated financial/task summaries, monthly revenue chart, upcoming work, project cards, and recent activity.
2. **Projects:** create and edit projects, client relationships, budget, due date, lead, color, brief, status filtering, search, and sorting. Detail dialogs link to tasks and related invoices. Invoiced projects retain their client association to protect invoice history.
3. **Task board:** four Kanban stages, drag and drop, keyboard-accessible status selectors, project filtering, task editing/deletion with confirmation, priority, assignee, due date, and details. Project completion is calculated from task state.
4. **Clients:** client profiles, search, contacts, relationship notes, project history, and paid invoice totals.
5. **Invoices:** create/edit draft, sent, and paid records; derived overdue status; currency totals; invoice previews; browser print/PDF; filtered CSV export. Spreadsheet formula prefixes are escaped in exported text.
6. **Analytics:** paid invoice revenue by issue month, project distribution, outstanding team workload, client revenue share, budget totals, and task completion.
7. **Settings:** profile editing, light/dark themes, JSON backup export, validated backup restore, and reset confirmation.
8. **Across the app:** hash navigation, responsive sidebar, Ctrl/Cmd+K workspace search, native accessible dialogs, status feedback, reduced-motion support, and guarded browser persistence.

## Architecture and data flows

`src/main.tsx` contains React screen components, dialogs, forms, the app context, and the navigation shell. `src/store.ts` defines the entity types, seeded workspace, reducer actions, relational validator, and derived metric functions. `src/styles.css` defines the visual system and responsive layouts. `build.mjs` type-checks through the npm build command and bundles the app with esbuild.

State is passed through a typed React context and updated with reducer actions. A task status change updates the shared task collection; project progress and overview counts are then recalculated from that collection. Marking an invoice paid changes its record, which updates the outstanding balance, collected revenue, and analytics without duplicated counters. Recent activity records creations and updates.

The versioned `atlas-studio-v1` localStorage record contains clients, projects, tasks, invoices, settings, and recent activity. Restore validates types, dates, uniqueness, bounds, and cross-entity references before replacing the workspace. Invalid backups leave the current state unchanged. If localStorage is unavailable, the session still works and a warning explains how to export a backup.

The reducer/context organization follows the pattern described in the [official React documentation](https://react.dev/learn/scaling-up-with-reducer-and-context).

## Verification

`npm test` covers data relationships, validation, invalid backups, project progress, invoice totals, overdue rules, immutability, and backup round trips. `test/browser.mjs` performs a full browser workflow including record creation, linked metrics, editing task status, reload persistence, search, theme switching, backup/export/restore, reset, and overflow checks at mobile sizes. That optional browser script currently uses the local workstation’s Playwright and Brave paths; adjust its import and executable path for your machine. Set `ATLAS_URL` to test another host.

## Deliberate limits

This is a **front-end portfolio demonstration**, not a production SaaS service. It has no backend, authentication, cloud database, permissions system, email delivery, payment processing, expense tracking, tax handling, or collaboration sync. Do not use it for real financial or confidential business records. Local data can be cleared by the browser. The revenue chart uses invoice issue dates and does not model settlement timing. Team names are seeded demo options. Different browser tabs do not synchronize live.

Potential production extensions include an authenticated API, relational database, server-side validation, audit logs, access control, real invoice line items and taxation, secure document delivery, and automated deployment pipelines. These are future work, not implemented features.

## Design

A quiet, editorial operations workspace: warm white surfaces, sage accents, fine borders, restrained iconography, informative density, and a fully implemented dark theme. No stock imagery is required.
