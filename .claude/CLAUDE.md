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

- 2026-08-18 — Made the sidebar "Deals" module item clickable, opening a new Potentials list page (`#deals-list-page`) reproduced from the user's screenshot of the real Zoho CRM Potentials module (All-Territories dropdown, All Potentials tab, Filter/Sort toolbar + Create Potential split button + Map View, left "Filter Potentials by" panel, and a Product Recommend/Potential Name/Amount/Stage/Closing Date/Account Name table incl. KIA-SEL-002). Clicking KIA-SEL-002 opens a new Deal detail page (`#deal-detail-page`) reproduced from the screenshots: the Blueprint stage strip (Qualification→…→Value Proposition[active]→…→Closed Lost to Competition + thumbs up/down), Overview/Timeline tabs, Stage/Probability/Expected Revenue/Closing fields, Best-time card, Contact Person, the left Related List nav + SALES SUMMARY, a **Deal Health · Survey Signals** panel (workflow-driven metric-agnostic design: health gauge + At-Risk badge + coverage chips + a workflow/stage touchpoints table showing whatever metric each fired survey returned — CSAT 4.2/Score 58%/Rating 3.0/NPS pending — worst-active driving the signal), and the **Zoho Survey related list** (Title/Sent Date/Responded Date/Sent By/Source/Response w/ View Response). Why: user asked to make Deals clickable, show the Potentials list + deal detail matching the screenshots, and surface survey signals per transition/workflow inside the deal.
- 2026-08-06 — Removed the "Skip this respondent if already sent in the last 30 days" checkbox from both the Send Survey list and New modals; renamed "Select Survey" to "Select Template"; added a "To" field below Name in the New modal, prefilled with a read-only-styled sample email address. Why: user asked to drop that checkbox, rename the label, and add a prefilled To/email field matching the Email Notification reference pattern.
- 2026-08-06 — Wired "Send Survey" in the workflow Add Action flyout to a two-step config flow modeled on the user's Email Notification screenshots: picking it opens a "Send Survey - {Module}" list modal (search box, magenta "New" button, Name/Survey/Modified On table, a "skip if already sent in last 30 days" checkbox row, Cancel/Associate) instead of adding the action directly; selecting a row and clicking Associate appends that config to Instant Actions. "New" opens a second modal ("Send Survey - {Module}": pink-bordered required Name + Select Survey fields, a "Best Time" checkbox, and an "Advanced Settings" section reusing the Lead detail Send Survey pattern — Choose Collector picklist + Custom Variable/"Add parameter" rows) with a magenta "Save and Associate" button that both saves the config and appends the action. Restyled both modals' primary buttons to solid magenta (#A02059) and added the sort caret + checkbox rows to match the screenshots more exactly after the first pass was flagged as not matching closely enough. Why: user asked for the Send Survey action to open these exact screens, with Advanced Settings (collector + custom variables) referencing the existing Send Survey details view.
- 2026-08-06 — Replaced the "Add Action" modal on the workflow rule setup page with an exact replica of the user's screenshot: clicking "+ Action" now opens a small inline flyout menu anchored directly below the Instant Actions card (not a centered modal), giving the card a pink border while open, listing Field Update/Assign Owner/Tags▸/Notify▸/Activities▸/Create Record/Create Connected Record/Webhook/Function/Actions By Zoho Flow — with one addition, "Send Survey" (marked "New"), inserted into that same list. Picking "Send Survey" appends it to the rule's Instant Actions; the other items are non-functional placeholders matching the real menu's shape. Why: user asked to replicate the exact "Add Action" screenshot with Send Survey added into that list.
- 2026-08-06 — Rebuilt the workflow rule setup page as an exact replica of the user's screenshot of the real Zoho CRM rule-builder canvas: dotted light-beige background, a "WHEN" circle node connected to a pink-bordered box with the dynamic "This rule will be executed whenever a {module} is created/edited..." sentence, a "CONDITION 1" diamond node connected to "This rule will be executed for all {module plural}.", an "Instant Actions" card listing the rule's configured actions with a "+ Action" row (still opens the existing action-type picker), a dashed "Scheduled Actions" placeholder, header controls (lock icon, "Add Description", Rule is Active/Deactivated text + Activate/Deactivate toggle + View Usage + "..."), and a sticky Save/Cancel footer. Module names are mapped to singular/plural (deal/deals, lead/leads, etc.) so the sentence reads correctly for any rule. Why: user asked to replicate the exact screenshot of what shows after clicking into the first workflow.
- 2026-08-06 — Rebuilt the Workflow Rules list page to replicate the user's screenshot of the real Zoho CRM Workflow Rules screen: real app topbar with a "← Setup Home" breadcrumb, a left Setup nav sidebar (Automation expanded, Workflow Rules highlighted), Rules/Usage tabs, the "Simply Build Data Processing!" Catalyst promo banner with an Explore Now button, a search box + "Workflow Creation using Zia" link + disabled "Reorder Rules" + "Create Rule" button row, and a table with checkbox/Rule Name/All▾(module)/Execute On/Actions(count)/Modified On(avatar+date)/Status(working green toggle switch) columns populated with the screenshot's real rule names (create_dbx_folder_for_lead, addEventsToBookings, Create lead, etc.) plus our own "Send CSAT Survey after Deal Closed-Won" rule carrying the Send Survey action. Why: user asked for an exact replication of the reference screenshot once a workflow rule is clicked into from Setup.
- 2026-08-06 — Removed the standalone "Actions" link under Setup Home's Automation category (it opened a generic action-types catalog page). "Workflow Rules" stays clickable, and the "Add Action" flow inside a workflow rule's setup page (which lists the same action types, including Send Survey) is unchanged. Why: user confirmed Settings → Setup is working correctly and asked to remove the separate Actions entry below Workflow Rules.
- 2026-08-06 — Wired up the Automation category on Setup Home: "Workflow Rules" now opens a Workflow Rules list page (Rule Name/Module/When/Executed On/Status); clicking a rule opens its setup page (When trigger card + Actions list with an "Add Action" button); Add Action opens a "Choose Action Type" overlay listing Email Notification/Task/Field Update/Webhook/Function plus a new **Send Survey** action type (marked "New"), and picking one appends it to that rule's Actions list. "Actions" on Setup Home also opens a standalone Actions catalog page with the same action types, including Send Survey. Why: user confirmed the chain Settings → Workflow Rules list → a workflow's setup page → Actions list → add Send Survey as a new action type — this is the mechanism that lets a CRM automation trigger (e.g. "Deal moves to Closed-Won") auto-send a survey, closing the loop discussed earlier between sending a survey and acting on business events.
- 2026-08-06 — Added a "Send Survey" button next to "Send Mail" in the Leads list bulk-selection action bar. Clicking it opens the existing Mass Email modal (matching the user's screenshot: To/Template/From/Send Options/Advanced Settings/Send) directly, but with the "To" field populated with the names of the bulk-selected records (e.g. "MiBonban, Mi Mau, Nice Karen") instead of the "+ Add Recipient" picker button, since the recipients are already fixed by the list selection. Why: user asked for a Send Survey bulk action that reuses the Mass Email screenshot's layout, with selected record names pre-filled in To.
- 2026-08-06 — Added an "Advanced Settings" collapsible section to the Send Survey modal on the Lead detail page, containing a "Choose Collector" dropdown and a dynamic "Url Parameter" row list (Add parameter / per-row Parameter Name + Parameter Value selects / +/× row controls) — mirroring the same Advanced Settings pattern already used in the survey module's Mass Email send flow (reusing its `ssCustomVars`/`ssModuleFields.Leads` option lists), implemented as its own local state (`ldParamRows`) so it doesn't interfere with the module flow's state. Why: user asked to add collector + URL param fields to the individual-record Send Survey flow, matching the existing survey-module implementation.
- 2026-08-06 — Removed the "Create Survey" and "Take Survey" buttons from the Lead detail page's Zoho Survey section, leaving only "Send Survey". Why: user asked to remove those two buttons.
- 2026-08-05 — Gave "View Response" its own "Response" column header (it had been embedded inline inside the Title cell with no labeled column), positioned as the 2nd column right after Title. Why: user pointed out View Response had no column name.
- 2026-08-05 — Reworked the Zoho Survey related-list table on the Lead detail page: "View Response" moved from its own far-right Response column to sit directly next to the survey Title; Responded Date is now filled in (was blank) since a response is simulated as already in; and added three new columns — NPS Score, CSAT Score, Total Rating — sourced from the same response data shown in the View Response box. Why: user asked for the responded date to be filled, View Response moved next to the title, and NPS/CSAT/Total Rating added as columns.
- 2026-08-05 — Restyled the Questions list inside the View Response box: replaced the 3-column table (Questions/Question Scoring/Answer) with a stacked per-question row matching the user's screenshot — question text on top, the respondent's answer directly below it, and the Question Scoring badge aligned to the right of that stacked block. Why: user said the scoring column layout didn't match the screenshot; question should be above, answer below, scoring on the right.
- 2026-08-05 — Wired up "Send Survey" from the Lead detail page's Zoho Survey related-list section, reproducing the user's 8 reference screenshots: a Send Survey modal (survey dropdown, auto-filled read-only Survey Link + Preview, optional Text To Display, Cancel/Insert), which on Insert opens a mail-compose popup (To chip, Subject, body with the display text as a hyperlink + signature, Send). Sending populates the Zoho Survey section with a real table (Title/Sent Date/Responded Date/Sent By/Source/Response) — but per explicit instruction the Response column shows a clickable "View Response" link instead of the screenshot's literal "Yet to Respond". Clicking "View Response" opens a Response Details box with the individual respondent's fields (Name/Email/Module/Response ID/IP/User agent/Survey URL/Start & Completion time/Time taken/Collector/Total rating/NPS/CSAT/Average rating/Score) plus a Questions table with a new "Question Scoring" column (colored score badge) alongside each question's answer. Why: user asked to build the Send Survey flow on the individual record detail page per the screenshots, with "View Response" replacing "Yet to Respond" and an added Question Scoring column.
- 2026-08-05 — Made "Mi Mau" clickable in the Leads list, opening a new Lead detail page (`#lead-detail-page`) reproduced from the user's screenshots: header (avatar, name, Add Tags, Send Mail/Convert/Edit/Add File to Dropbox actions), Overview/Timeline/Data Privacy tabs with "Last Update" timestamp, Mobile/Lead Source fields, "Best time to" and "Similar Leads" cards, and the related-list sections below (Visits - Zoho SalesIQ, ZohoSign Documents, solutions, Dropbox Files, Remote Assist, Zoho Survey with Create/Send/Take Survey buttons) matching the screenshot content. Clicking "Zoho Survey" in the left Related List nav now smooth-scrolls all the way down to that section, matching the third screenshot's highlighted state. Also added a bulk-selection action bar to the Leads list page: checking any row (or the header checkbox) replaces the toolbar with "N Records Selected. Clear | Select All records in this view" plus Send Mail/Tags/Send with Zoho Sign/more buttons, and selected rows get the pink highlight — reproduced from the fourth screenshot. Why: user asked to make Mi Mau and the Zoho Survey related-list item clickable per the latest screenshots, and to show the bulk-action bar on multi-select.
- 2026-08-05 — Made the sidebar "Leads" module item clickable, opening a new full-screen Leads list page (`#leads-list-page`) reproduced from the user's latest screenshots of the real Zoho CRM Leads module: same topbar, "All Leads"/"Converted Leads" tabs, Filter/Sort/view-icon toolbar with a "Create Lead" split button, a left "Filter Leads by" panel (System Defined Filters + Website Activity checkbox groups), and a table (Lead Name/Lead Owner/Email/First Name/Created By) populated with the exact 19 sample rows visible in the screenshots, with the same pink row-hover highlight. Back arrow returns to the Zoho Survey list. Why: user asked to make "Leads" in the list view clickable and match the latest desktop screenshot for what shows when clicked.
- 2026-07-30 — Rebuilt the Setup Home and Marketplace-Zoho pages added earlier the same day to match the user's two reference screenshots far more closely: Setup Home now reuses the real app topbar (search/icons/avatar row) with a bare back arrow instead of a text header, a "Setup"-title-plus-search-plus-"Customize Setup"-button row, and the 10 categories laid out as two bordered 5-column blocks with per-category line icons and internal column dividers, matching the screenshot's grouping and spacing. The Marketplace-Zoho page now has a "← Setup Home" breadcrumb header (colored to match the account's accent), a left-hand Setup navigation sidebar (grouped by category, auto-scrolled to and highlighting the active "Zoho" item under Marketplace) alongside the six app cards, replacing the emoji icons with outline SVG icons and a bordered 3-column card grid. Why: user said the first version didn't do justice to the screenshots — alignment and structure were off — and asked to match them as closely as possible.
- 2026-07-30 — Wired up the top-bar settings (gear) icon to open a new full-screen "Setup Home" page listing CRM setting categories (General, Security Control, Customization, Channels, Automation, Process Management, Experience Center, Data Administration, Marketplace, Developer Hub) reproduced from the user's screenshot. Clicking "Zoho" under Marketplace opens a second new page, "Marketplace — Zoho", showing the six Zoho app integration cards (Backstage, Meeting, Projects, Desk, Survey, Cliq) reproduced from the user's second screenshot, each with its description and Manage/Setup/Continue button. Both are new top-level fixed-position overlay pages (`#setup-page`, `#marketplace-zoho-page`) with back-arrow navigation (Setup → survey list, Marketplace-Zoho → Setup). Why: user shared two screenshots and asked that clicking Settings show the setup list, and clicking Zoho from there show the marketplace apps screen.
- 2026-07-30 — Reverted the Survey Quota body (progress bar + meta labels) back to the original flat linear bar with the "142 / 200" fraction and Limit/When Reached/Remaining labels, undoing both the radial-ring redesign and its simplified follow-up from earlier the same day. Kept the "View Conditions" button and its real-condition popover exactly as they are now (positioned next to the "Survey Quota" title, showing the survey's actual configured condition(s) on click) — only the bar and the elements below it were reverted. Why: user asked to keep View Conditions as-is but revert the bar and everything below it to how it looked at the start.
- 2026-07-30 — Simplified the Survey Quota section redesigned earlier the same day: removed the duplicated 3-tile meta grid and the always-on percentage badge (both restated the same number already shown in the ring), replacing them with one plain-language sentence ("142 of 200 responses collected") plus a single secondary line ("58 responses left before the quota is reached • When reached: Close the survey"). The status badge now only appears as a warning — "Almost full" at ≥90% collected, "Quota reached" at 100% — and is hidden otherwise instead of restating the ring's percentage. Verified on 71% (no badge), 86% (no badge), and reused the reached/empty-state cases from the earlier redesign. Why: user said the redesigned version was confusing and asked for something easier to understand.
- 2026-07-30 — Redesigned the Survey Quota section (below Response Statistics): replaced the flat linear progress bar with an SVG radial progress ring + percentage, a fraction line ("142 / 200 responses collected"), and a 3-tile meta grid (Limit/When Reached/Remaining) matching the Response Statistics tile style; added a status badge on the far right (color-coded by how close to quota). Moved "View Conditions" from a far-right link (easy to miss) to sit directly next to the "Survey Quota" title. Clicking it now opens a read-only popover showing the survey's actual configured quota condition(s) — pulled from a new `quotaConditions` field on each survey object — rendering multiple conditions with an "AND" divider, or a "No condition set" empty state when none are configured. Verified against 3 cases: single condition (Customer Satisfaction Survey Q1 2025), two AND-chained conditions (Employee NPS — Q1 2025), and no conditions (Product Onboarding Feedback). Why: user asked for a different visual treatment of the quota section, said the old "View Conditions" placement was easy to miss, and wanted it to actually show the configured condition instead of a generic/blank editor.

- 2026-07-30 — Extended chart-to-table cross-filtering into the "Details" expandable tables of Overall CSAT Score and Average Ratings. Replaced their dummy travel-themed question rows with the survey's real questions (qSatisfied/qMeeting/qLimitations/qFollowup/qRate) and real Yes/No/rating counts computed from `sdRespData`; clicking a Yes/No/rating count now filters All Respondents the same way the other charts do. Why: user asked that clicking a question in these two cards' expanded Details should filter the table too.

- 2026-07-30 — Made the first 4 Survey Reports charts (Responses by Module, Responses by Collector, Daily Responses Trend, Overall CSAT Score) cross-filter the All Respondents table: clicking a legend/bar/point/row scrolls to and filters the table to matching respondents, with a dismissible chip ("Module: Leads ×") replacing the earlier plan of a plain Clear link. Reconciled each chart's mock numbers/colors to actually match `sdRespData` (6 respondents) so the filtered counts are truthful instead of the old illustrative-only totals. Skipped the 5th chart (Average Ratings, per-question) — it has no per-respondent field to filter by (all 6 respondents answer every question), so a row filter there wouldn't narrow anything; flagged to user rather than faking it. Why: user asked for chart-to-table cross-filtering with an X-to-clear affordance.

- 2026-07-30 — Reverted the "Pending Responses" and "CSAT & NPS by Account" cards added earlier the same day. Why: user asked to remove them after reviewing.
- 2026-07-30 — Added two new Survey Reports cards on the survey detail page: "Pending Responses" (sent-but-not-responded count + preview list + per-row "Remind"/"Remind All") and "CSAT & NPS by Account" (per-account CSAT/NPS snapshot with a trend arrow and a flagged-account callout). Why: closes gaps against the persona doc's stated needs ("who hasn't responded yet", "CSAT/NPS trends per account") that weren't covered by the existing aggregate-only cards.
- 2026-07-29 — Fixed Night-mode dark theme to cover every page, not just the survey list. Root cause: the invert+hue-rotate filter was scoped to `.app` (sidebar+list only) — `#create-survey-page`, `#form-builder-page`, `#survey-detail-page`, and the various modal overlays are separate top-level siblings of `.app` under `<body>`, so they were untouched. Rescoped the dark-mode rule to `body.app-dark-mode > *:not(#um-overlay)` so it covers every top-level page/overlay while leaving the (already-dark) account menu panel alone. Why: user reported only the list page went dark.

- 2026-07-29 — Added the account/user menu (click the "M" avatar top-right): profile, org switcher, plan card, Day/Night/Auto mode toggle, theme swatches, Need Help/News room/Mobile App sections, My Account/Sign Out footer. Night mode now applies an app-wide dark theme (invert+hue-rotate filter on `.app`, double-applied to `<img>` to cancel it). Why: user provided a screenshot of the desired account panel and asked for the dark theme toggle to actually work.
- 2026-07-23 — Replaced the left sidebar with the Figma "Nxt Gen Left Menu" design (white bg, static nav section, CRM Teamspace switcher, Search Modules box, icon-led module list, collapsible Activity/Inventory/Projects/Cliq Channels folders). Why: user asked to apply that Figma section to the list view page's module nav.
- 2026-07-23 — Repo initialized and pushed; began tracking mock edits here going forward.
