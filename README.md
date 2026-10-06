# 10102C Override strategy

Static GitHub Pages documents for team discussion and practice.

- `index.html` is the reading hub.
- `secure-lead.html` and `lead-calculator.js` explain and calculate a selected finish.
- `field-board.js` supplies four draggable robots, toggle menus, route drawing,
  local drawing persistence, SVG export and a copy-for-chat state export.
- `research.html` separates dated public proposals from current rules and our analysis.
- `stress-tests.html` is adversarial analysis, not claimed simulator results.
- `assets/driver-view.png` is an inspected Roblox Studio opening-field capture.
  It is an orientation image, not the calculator's hypothetical scored setup.

Deploy through the repository's existing GitHub Pages main/root configuration.
No service keys, build service, analytics or backend are needed. Diagram persistence
uses only the reader's browser; exporting is an explicit user action.

Validation on October 5, 2026: 263 scoring assertions; all HTML pages loaded in a
headless browser; no JavaScript errors; calculator changes, invalid-input handling,
toggle menus, robot keyboard movement, drawing/undo, state export and desktop/mobile
layout checked. Every relative page/script/style/image link resolves.

Autonomous routine design and robot-specific timing remain deliberately deferred.
