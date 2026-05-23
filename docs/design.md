# Visual Square ERP Design Guide

This guide is the working design reference for the internal ERP. It distills the Visual Square build spec into rules that should be checked before changing UI.

## Product Feel

- Internal screens should feel quiet, precise, and operational.
- The ERP is not a marketing page. Prioritize scannable lists, compact forms, clear hierarchy, and consistent controls.
- Visual Square is a design agency, so rough default admin UI is not acceptable. Functional changes still need to preserve the brand tone.

## Brand Tokens

| Role | Value | Use |
| --- | --- | --- |
| Foreground | `#141414` | Main text |
| Muted | `#6F6660` | Secondary text, metadata |
| Surface | `#FBF6F3` | Form panels |
| Strong surface | `#F5ECE6` | Subtle emphasis only |
| Border | `#E7E2DD` | Primary dividers |
| Strong border | `#D8CEC6` | Inputs and utility controls |
| Coral | `#F57D4B` | Primary actions only |
| Quiet coral | `#FDEDE4` | Active nav, soft emphasis |
| Strong coral | `#B5491F` | Text on quiet coral |

## Typography

- UI text uses Pretendard/Inter/system sans.
- Display serif is only for brand/logo-like moments. Do not use serif for Korean UI labels.
- Tables, money, quantities, and counts use tabular numbers.
- Labels use small uppercase text with moderate letter spacing.
- Avoid oversized text inside forms, cards, and table controls.

## Shape & Layout

- Corners stay square or nearly square. Avoid rounded pill buttons.
- Use borders and spacing instead of heavy shadows.
- Do not put cards inside decorative cards. Panels are functional frames, not visual decoration.
- Lists come first for CRM, vendors, PO, bills, and invoices. Forms open only after an Add or Edit action.
- Form sections should be compact. Avoid forcing horizontal scroll unless the field group is truly tabular.

## Buttons & Actions

- Primary coral buttons are only for top-level create/save actions.
- Secondary row actions such as edit, delete, and add line item should be small utility controls.
- Icon buttons need `aria-label`; icon + text buttons should stay compact.
- Delete actions use subdued danger styling and require confirmation.

## Data Entry Patterns

- Document numbers, dates, and status fields belong near the document header.
- Money totals should be calculated from line items when line items exist.
- Line item rows should use `Item / Unit Price / Qty / Total`.
- The final document total appears after the line items as `Total Amount`; it should not compete visually with form headings.

## Copy

- Internal navigation can be bilingual when it matches industry usage: `Invoice`, `PO / Bill`.
- Field labels for financial documents should prefer common US business terms.
- Placeholders use examples and an ellipsis character: `Business cards…`, not `Business cards...`.
