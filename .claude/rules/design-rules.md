# Design Rules — Zoho CRM Standard Components

Source: Figma "CRM and Webinar Integration" style guide
(https://www.figma.com/design/zBznyEXaHmU2aNJ3ECs9vF/CRM-and-Webinar-Integration).
These are the actual Zoho CRM design tokens and component specs — use them for every
screen we build so the mock looks and feels like native Zoho CRM, not a generic UI.

Font family throughout: **Zoho Puvi** (weights used: Regular, Medium, Semibold).

## Color tokens

### Base / text colors
| Token | Hex |
|---|---|
| Primary Palette / Heading | `#202123` |
| Primary Palette / BaseColor | `#313949` |
| Primary Palette / Label | `#616E88` |
| Primary Palette / Paragraph | `#434D5E` |
| Primary Palette / Link | `#5464F2` |
| Common Bg / Full White | `#FFFFFF` |
| Common Bg / Card BG | `#FFFFFF` |
| Border Colors / Border 1 | `#C5C4D3` |
| Border Colors / Border 2 | `#D6D6E3` |

### Button colors (gradient top→bottom or as noted)
| Variant | State | Colors |
|---|---|---|
| Primary | Default | `#5767F6` → `#124DC3` |
| Primary | Hover | `#3E4DEC` → `#0E3B98` |
| Primary | Active/Click | `#1344A9` |
| Primary | Disabled | bg `#ADB3EE`, text `#FFFFFF` |
| Default (secondary) | Default | `#FFFFFF` → `#F1F0F7`, border `#D5D8E9` |
| Default | Hover | `#FFFFFF` → `#EAEBF5` |
| Default | Active | `#F0F1F8` |
| Default | Disabled | bg `#F6F6FB`, text `#9394AF` |
| Negative (destructive) | Default | `#FF4657` → `#E23041` |
| Negative | Hover | `#FC5060` → `#D30B1E` |
| Negative | Disabled | bg `#FFB1B8` |
| Success | Default | `#11B670` → `#0F935B` |
| Success | Hover | `#13C177` → `#0F9A5F` |
| Warning | Default | `#F5973A` → `#DB842F` |
| Outline Blue | Default | text/border `#5464F2`, bg `#F0F1FF` |
| Outline Green | Default | text `#10975E`, border `#19B171`, bg `#E9FBF4` |
| Outline Red | Default | text `#F63648`, border `#FF4D5B`, bg `#FFF2F3` |
| Outline Orange | Default | text `#F57C00`, border `#E28C27`, bg `#FFF9ED` |
| Ghost Blue | text `#5464F2`, bg `#EEEFFF` (hover) |
| Ghost Red | text `#FF5D5A`, bg `#FFE8EA` (hover) |
| Links: Primary | `#5464F2` (hover `#3752CA`) |
| Links: Secondary | `#313949` (hover `#3752CA`) |
| Links: Default | `#616E88` |
| Links: Red | `#FF5D5A` (hover `#F14A47`) |

Buttons are `border-radius: 6px`, height `32px` (default), padding `~8px 12–14px`.
A "Small" size variant exists for all button types at reduced padding.
Disabled states drop opacity (~40–50%) on the base color rather than using a flat grey.

### Input field colors
| Token | Hex |
|---|---|
| Default outline | `#C0C8E2` |
| Hover outline | `#797883` |
| Focus outline | `#5464F2` (+ focus shadow `rgba(76,94,253,0.5)`, 6px blur) |
| Error / mandatory outline | `#FF5D5A` |
| Disabled bg | `#F5F6F8` |
| Disabled outline | `#D2D9F1` |
| Placeholder text | `#8C91AB` |
| Icon bg (inline input icon) | `#F4F4F6` |

### Tabs colors
| Token | Hex |
|---|---|
| Tab border | `#DCDBEE` |
| Tab hover bg | `#F2F4FF` |
| Tab active bg (pill/secondary style) | `#EBEDFF` |
| Tab active border | `#A3ACFF` |
| Tab inner border (count badge, active) | `#D2D7FF` |

### Modal / shadow
| Token | Value |
|---|---|
| Modal shadow | `0px 4px 9px rgba(49,57,73,0.6)` |
| Modal overlay scrim | `#313949` at 50% opacity |
| Modal corner radius | `15px` (bottom corners on the header-attached form) |

## Component specs

### Buttons
- Height `32px` default / smaller "Small" variant.
- `border-radius: 6px`.
- Label: Zoho Puvi Medium, `14px`, centered, `2px` right padding on text for optical balance.
- States: Default, Hover, Active/Click, Disabled, Loading (has a 4-stop opacity-fade "loader" color ramp per variant).
- Variants: Primary, Default (secondary/neutral), Negative, Success, Warning, Outline (Blue/Green/Red/Orange), Ghost (Blue/Red), Zia (AI-branded), Link (Primary/Secondary/Default/Red), plus icon-only "More" buttons.
- Use **Primary** for the main affirmative action in a modal/form (e.g. Save), **Default** for Cancel, **Negative** for destructive confirm (e.g. "Yes, Continue" in delete alerts).

### Inputs
- Height `34px`, `border-radius: 6px`, `1px` solid border, white background.
- Left accent bar (`3px` wide) inside the border on the default/hover/focus/disabled states — a Zoho CRM signature detail, keep it.
- States: Default (`#C0C8E2` border) → Hover (`#797883` border) → Focus (`#5464F2` border + soft blue glow) → Error (`#FF5D5A` border + helper text below in the same red, `11px`) → Disabled (`#F5F6F8` bg, `#D2D9F1` border).
- Placeholder text `14px`, color `#8C91AB`.
- Variants: plain text, prefix label (e.g. "USD" divider inside the field), prefix dropdown (e.g. "None ▾" divider), trailing icon button (info icon in a shaded `32×32` box), trailing "Ajax Edit" (inline check/cross confirm icons appear next to a field being edited), date+time compound field, large "title-style" input (`20px` semibold text for heading fields).

### Dropdown / Multiselect / Tags
- Same shell as Input (34px, 6px radius, same border/left-accent styling).
- Supports: front icon, prefix label, prefix "dropdown-in-dropdown" (None ▾ segment), trailing clear (×) icon, trailing arrow, trailing link ("Pick") with underline, and a right-aligned save action (Ajax Edit check/cross).
- Multiselect adds tag chips with an overflow "+N more" tag.

### Tabs
- Two sizes: Primary Tab (`15px` label) and Small Primary Tab (`12px` label) — underline style, `2–3px` active indicator bar in Primary Palette/Link blue under the active label, full-width bottom border line under the whole tab row.
- Secondary Tab / Small Secondary Tab — pill style instead of underline: active state gets a filled pill (`#EBEDFF` bg, `#A3ACFF` border, fully rounded `100px`), inactive tabs sit on white with no border, all pills padded `20px`/`12px` horizontal.
- Optional count badge (rounded pill, outlined, showing a number) next to any tab label.
- Optional drag handle (gripper icon) on primary tabs for reorderable tab sets.
- Use **Primary Tab** for top-level page navigation (e.g. survey detail Overview/Timeline), **Secondary Tab (pill)** for a filter/sub-view switch within a panel (e.g. All/Completed/Partial toggle).

### Modals / Alerts
- Card: white bg, rounded bottom corners `15px` only (header edge is flush, since a modal typically sits under a colored/gray header bar), drop-shadow `0 4px 9px rgba(49,57,73,0.6)`.
- Backdrop: base canvas overlaid with `#313949` at 50% opacity.
- Three modal patterns:
  1. **Form** — heading (`20px` semibold, optional round icon), label+field rows (labels right-aligned `14px` `#616E88`, fields left-aligned using the Input/Dropdown components above), footer buttons right-aligned (Default "Cancel" + Primary "Save").
  2. **Alert (heading + body)** — round icon, `20px` semibold question/title, `14px` regular paragraph body (`#434D5E`), footer buttons.
  3. **Alert (heading only)** — icon + two-line `15px` semibold message, no separate body paragraph, used for lightweight confirms (e.g. delete confirmation) with Default "Cancel" + **Negative** "Yes, Continue".
- Always pair Cancel (Default button) on the left with the primary/destructive action button on the right, action buttons at the end of the modal, gap `10px` between them.

### Steps/Stepper
- "Steps" component available in both a colored multi-step state and single-color variants — use for wizard flows (e.g. our Send Survey wizard: Module Chooser → Collector → Recipients → Mass Email).

### Other primitives available (use as needed, specs not yet pulled in detail)
Checkbox, Radio Button, Switch, Breadcrumb, Search, Pagination, Tooltip, User Avatar,
Icon set. Checkbox default state: `15px` box, `2px` border `#C0C8E2`, `3px` corner radius,
white fill when unchecked.

## Notes / gaps
- No dedicated Table component was found in the scanned Figma subtree — for tables
  (e.g. survey responses, recipient picker), extend the base card/row conventions
  above (white bg, `#C5C4D3`/`#D6D6E3` borders, `14px` Puvi Regular body text,
  `#202123` headings) rather than inventing a new visual language.
- Typography scale (heading/body type ramp) not yet fully extracted — will update
  this file once pulled.
