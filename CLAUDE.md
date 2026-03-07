# ClaudeTesting — Project Context

## About This Workspace
This is a personal prototyping workspace on the Desktop. Projects here are standalone HTML/JS experiments and web apps — single-file where possible, no build tools, no frameworks unless explicitly needed.

## Completed Projects

### OrbitCheck (`orbitcheck.html`)
Single-file HTML web app that scores Starlink suitability vs. local ISPs.
- **Stack:** Vanilla JS, Canvas API, Google Fonts (Barlow Condensed, Barlow, DM Mono)
- **Features:** 7-step multi-step form, scoring algorithm (0–100), loading sequence, results page with canvas map (pan/zoom/hover), comparison table, pros/cons grid
- **Design language:** Black/white brutalist — no border-radius, sharp edges, monospace labels, custom cursor (`mix-blend-mode: difference`), noise overlay, scroll reveal
- **Data:** 13 hardcoded ISPs + Starlink, ZIP → lat/lon lookup, 3-digit prefix fallbacks

## Design Preferences (established)
- Background `#000`, text `#fff`, muted text `#888`/`#c0c0c0`
- No border-radius on interactive elements (buttons, inputs)
- Font stack: Barlow Condensed 900 for headings, Barlow for body, DM Mono for labels/code
- Custom cursor (`cursor: none`) with fixed 12px circle dot
- Scroll reveal via `IntersectionObserver`
- Section labels in DM Mono uppercase 11–12px with letter-spacing

## Workflow Preferences
- Single-file HTML preferred for standalone tools
- No external dependencies beyond Google Fonts
- Zero build step — open directly in browser
- Plan mode used for larger features before implementation

## Notes for Future Sessions
- If continuing OrbitCheck: map canvas is in `#results` section, initialized via `initMap()`, reset via `resetTool()`
- Scoring algorithm lives in `computeScore()` / `computeSubScores()` in the `<script>` block
- Provider data is in the `PROVIDERS` object at top of script
