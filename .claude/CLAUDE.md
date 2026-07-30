# Product Knowledge: Zoho CRM ⇌ Zoho Survey Integration

This file gives Claude the product context needed to work on this codebase. It is
knowledge, not engineering convention — see other docs (once added) for tech stack
and coding rules.

## What this product is

A Zoho Survey experience embedded inside Zoho CRM, letting a CRM user create surveys,
send them to CRM records (Leads/Contacts/custom modules), and sync responses back into
CRM as records or field updates. Reference mock: `mock-reference.html` (a static,
single-file HTML mock — screens, flow, and mock data only, not production code).

## Company context

Zoho is a business software company that builds a broad suite of interconnected apps
(CRM, Survey, Campaigns, Books, Desk, and dozens more), sold both standalone and as
part of a unified operating suite. The strategic bet behind this project is Zoho's
cross-product integration story: instead of a customer buying a survey tool,
manually exporting results, and re-importing them into their CRM, Zoho apps talk to
each other directly. Zoho Survey's full feature set already exists as a mature
standalone product — the job here is adapting and re-flowing those existing features
so they work naturally *from within* Zoho CRM, not building new survey functionality
from scratch.

## Primary persona

**Jay — Sales Rep / Account Executive**
- Lives in Zoho CRM daily; uses the embedded Survey feature end-to-end but only
  within CRM — he has never used standalone Zoho Survey and doesn't want to learn it
  as a separate product.
- **Creates** surveys himself (e.g. a post-deal CSAT survey, a periodic NPS check-in)
  using CRM-native language and his own CRM data/fields, not generic survey jargon.
- **Sends** surveys to his own Contacts/Leads directly from the CRM records or views
  he already works in — e.g. right after a deal moves to Closed-Won.
- **Watches analytics**: response rates, CSAT/NPS trends per account, who hasn't
  responded yet — reading results back on the record and in reporting, without
  leaving CRM to check a separate Survey dashboard.
- Technical comfort: strong in CRM concepts (modules, records, fields, tasks); no
  interest in survey-specific concepts (collectors, quotas, logic builders) beyond
  the minimum required to create, send, and read results.
- Frustration trigger: any step that feels like operating a second product (e.g. a
  collector-setup screen, a generic template picker) instead of an extension of the
  CRM he already knows.
- Also acts as the **CRM admin** for this integration — he's the one who sets up the
  Push to CRM config (field mapping, field value mapping, target module/layout,
  record assignment rules) as well, so no separate admin persona is needed.
- Design implication: Jay is the lens for the **entire surface** — survey creation,
  the Push to CRM admin config, the Send Survey wizard, and reporting/analytics. Every
  screen in this project should be designed against his needs and technical comfort.

## Zoho CRM concepts used here

- **Module**: a CRM object type — standard (Leads, Contacts, Accounts, Potentials) or
  custom. Surveys are sent to records that live inside a module.
- **Record**: a single row/entity within a module (e.g. one Lead).
- **Layout**: the field arrangement/form definition for a module — Standard or Custom
  layouts can differ in which fields exist.
- **Field**: a single data attribute on a module (First Name, Email, Phone, Company...).
  Some are required for the module (e.g. Last Name, Email on Leads).
- **Assignment Rules**: CRM automation that decides which user/team owns a new record.
  Relevant when survey responses create new CRM records and need an owner.
- **Users / Teams / Roles**: CRM's ownership and permission model. Record Assignment
  (below) can target any of these.
- **Workflows/Automation**: CRM's broader rule-based automation system. This mock does
  not model workflows explicitly — they only appear as generic dropdown options, not
  as a designed integration point (worth clarifying with the PM before building).

## Zoho Survey concepts used here

- **Survey**: the top-level object — has a name, category, type/template, appearance
  settings (logo, intro page), respondent-experience settings (timer, progress bar,
  captcha, quotas, save-and-continue), and completion/distribution settings (end page,
  disqualification page, redirect, social preview).
- **Collector**: a distribution channel/audience funnel for a survey — every response
  is tagged with the collector it came through. Collectors have their own name, quota,
  and auto-close behavior. Used both for sending (choose a collector to send through)
  and reporting (Responses by Collector). Created from the Launch tab → Collector List
  dropdown → "Add New Collector" → set a Collector Name → Save. Each collector gets its
  own web link, and that link updates automatically whenever the collector's settings
  are edited (quota, name, etc.) — existing distributions keep working off the same
  updated link rather than needing to be resent. Segmenting respondents into distinct
  collectors (e.g. by audience type) lets reporting break results down and compare
  across those segments
  ([source](https://help.zoho.com/portal/en/kb/survey/launch/collectors/articles/collectors)).
- **Question / Form Builder**: surveys are built page-by-page with questions; question
  editors support merge variables (e.g. "Collector Name") for personalization.
- **Response**: one respondent's submission — status (Completed/Partial/Over-Quota),
  timing (start/completion time, time taken), IP address, per-question answers, and —
  in the CRM-integrated context — an associated CRM module, record link, and metrics
  (NPS score, CSAT score, average rating, tags).
- **Logic/Condition builder**: used in quotas, end pages, and disqualification pages —
  Field + Condition (Equal to / Not equal to, etc.) + Value rows, evaluated against
  collector or answer data.
- **Custom Variables**: store known respondent info (e.g. from CRM) inside a survey
  without asking the respondent a question for it. Configured under Advanced Options →
  Custom Variables — each has a URL Parameter name, a Label, and a Type (Text, Email,
  Number, or Choice with 2+ options). Values are passed in via URL params on the survey
  link (`?email=...`, or `?var1=[value]&var2=[value2]` for multiple). Once set, a
  variable can be piped into question text for personalization, used in Display Logic
  like a question answer, and populated automatically via merge tags from Zoho CRM,
  Zoho Campaigns, or MailChimp — this is the mechanism most relevant to CRM record data
  flowing into a survey link without extra questions
  ([source](https://help.zoho.com/portal/en/kb/survey/survey-builder/advanced-options/custom-variables/articles/custom-variables)).

## How the two connect (the actual integration surface)

1. **Push to CRM** (survey-level toggle + "Manage Configuration" modal): the core
   config screen that defines how this survey talks to CRM. It has three distinct
   sub-concepts — don't conflate them:
   - **Field Mapping**: maps CRM fields (First Name, Last Name*, Email*, Phone,
     Company, City, State, Country) 1:1 against survey questions, so an answer fills
     a CRM field.
   - **Field Value Mapping**: sets a *static* default value for a CRM field (e.g.
     always set Company = "Test"), independent of any survey answer.
   - **Record Assignment**: decides who owns a CRM record created/updated from a
     response — either "Users matching certain conditions" or CRM's Assignment Rules.
   - Also configures target **module** (Leads/Contacts/custom) and **layout**
     (Standard/Custom), plus duplicate handling ("if a lead already exists":
     Skip vs Create New).
2. **Send Survey wizard**: Module Chooser (pick target CRM module) → Choose Collector
   (pick collector + URL params) → recipient picker (a filterable table of actual CRM
   records to send to, with search/select-all, and a "Create Lead" shortcut) → Mass
   Email compose (To/Template/From) → template selection.
3. **Response → CRM sync**: every response mock record carries `module`,
   `responseId`, `collector`, plus CRM-context fields (customercode, accounttype,
   country, phone) alongside survey metrics — this is the shape a response takes once
   synced back to CRM.
4. **Reporting ties back to CRM context**: "Responses by Module" and
   "Responses by Collector" reports segment survey results by which CRM module (and
   which collector) they came from — the two systems share a reporting lens, not just
   a data-push.

## Terminology quick-reference

| Term | Belongs to | Meaning |
|---|---|---|
| Module | CRM | Object type (Leads, Contacts, custom) |
| Layout | CRM | Field arrangement for a module |
| Assignment Rule | CRM | Automated record-ownership logic |
| Collector | Survey | Distribution channel / response funnel |
| Push to CRM | Integration | Survey→CRM sync config (mapping + assignment) |
| Field Mapping | Integration | Question → CRM field, dynamic |
| Field Value Mapping | Integration | CRM field ← static value |
| Record Assignment | Integration | Who owns the resulting CRM record |

## Working agreement

- After every meaningful update to the local build, open/refresh it in the browser
  (via the claude-in-chrome tools) at `http://localhost:8080` so the user can see the
  change live without doing it manually. Requires the Chrome extension connected
  (`/chrome`) — if unavailable, tell the user to refresh manually instead of skipping
  this silently.
- Every edit to `mock-reference.html` gets committed to git, and this file's Mock Edit
  Log (below) gets a new entry in the same commit describing what changed and why.
- After every commit, push to `origin/master` (the global master) right away — don't
  let commits sit local-only. If the push fails or is rejected, tell the user instead
  of silently skipping it.

## Mock Edit Log

Reverse-chronological log of edits made to `mock-reference.html`. Each entry: date,
one-line summary, why.

- 2026-07-30 — Added two new Survey Reports cards on the survey detail page: "Pending Responses" (sent-but-not-responded count + preview list + per-row "Remind"/"Remind All") and "CSAT & NPS by Account" (per-account CSAT/NPS snapshot with a trend arrow and a flagged-account callout). Why: closes gaps against the persona doc's stated needs ("who hasn't responded yet", "CSAT/NPS trends per account") that weren't covered by the existing aggregate-only cards.
- 2026-07-29 — Fixed Night-mode dark theme to cover every page, not just the survey list. Root cause: the invert+hue-rotate filter was scoped to `.app` (sidebar+list only) — `#create-survey-page`, `#form-builder-page`, `#survey-detail-page`, and the various modal overlays are separate top-level siblings of `.app` under `<body>`, so they were untouched. Rescoped the dark-mode rule to `body.app-dark-mode > *:not(#um-overlay)` so it covers every top-level page/overlay while leaving the (already-dark) account menu panel alone. Why: user reported only the list page went dark.

- 2026-07-29 — Added the account/user menu (click the "M" avatar top-right): profile, org switcher, plan card, Day/Night/Auto mode toggle, theme swatches, Need Help/News room/Mobile App sections, My Account/Sign Out footer. Night mode now applies an app-wide dark theme (invert+hue-rotate filter on `.app`, double-applied to `<img>` to cancel it). Why: user provided a screenshot of the desired account panel and asked for the dark theme toggle to actually work.
- 2026-07-23 — Replaced the left sidebar with the Figma "Nxt Gen Left Menu" design (white bg, static nav section, CRM Teamspace switcher, Search Modules box, icon-led module list, collapsible Activity/Inventory/Projects/Cliq Channels folders). Why: user asked to apply that Figma section to the list view page's module nav.
- 2026-07-23 — Repo initialized and pushed; began tracking mock edits here going forward.
