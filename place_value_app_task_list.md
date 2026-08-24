# Place Value Practice App — Task List

**Context:** Front-end-only React (Vite) app for 5th grade students (NAT2020) to
practice place value / decimal system concepts. No backend, no authentication.
Deployed via GitHub Pages. Built in vertical slices, but shared components must
be factored out from Task 1 onward rather than duplicated per task.

## ⚠️ MANDATORY RULE FOR THE AGENT

**Stop after every task below and wait for explicit user verification before
starting the next one.** Each task must produce something the user (a human,
non-developer teacher) can actually open and test — not just code that compiles.
When a task is done:
1. Summarize what was built.
2. State exactly how to test it (URL, command, or steps).
3. Wait for the user to confirm it works before proceeding.

Do not batch multiple tasks together, even if the next one seems trivial.

---

## Phase 0 — Technical Setup

### Task 0.1 — Repository & Vite scaffold
- Create GitHub repository.
- Scaffold a React app with Vite.
- Commit and push initial scaffold.
- **Verify:** User runs the app locally (`npm run dev`) and sees the default Vite + React starter page.

### Task 0.2 — GitHub Pages deployment pipeline
- Configure Vite `base` path for GitHub Pages.
- Add deployment workflow (e.g. GitHub Actions or `gh-pages` package).
- Deploy the untouched starter app.
- **Verify:** User opens the live GitHub Pages URL and sees the same starter page, confirming the full pipeline (push → build → deploy) works end to end.

### Task 0.3 — Minimal app shell
- Replace starter content with a bare app shell: title, empty placeholder area, and a simple nav/menu stub (can be non-functional links/labels for now, one per future task type).
- Deploy.
- **Verify:** User sees the shell live on GitHub Pages before any real logic is written.

---

## Phase 1 — Task 1 Vertical Slice: "Build the Number" (+ shared foundations)

This phase takes longer since shared foundations are built alongside the first task.

### Task 1.0 — Design foundations (shared)
- Define a small design system before building any interactive component: color palette (1–2 base colors + one accent for correct/success), typography scale (large, highly legible digits — target audience is 10–11 year olds), spacing rules.
- Correct/incorrect feedback must not rely on color alone — pair with icon or shape (e.g. check/cross) for color-blind accessibility.
- Layout must stay visually close to the textbook's place value table (grouped into classes: units / thousands / millions, each internally split into ones-tens-hundreds), so students recognize the same structure they see in the book.
- Design mobile/tablet-first (classroom devices), with touch targets large enough for drag-and-drop on a tablet, then scale up to desktop.
- Keep visual style calm and uncluttered — minimal animation, no visual noise competing with the math content.
- Produce a small static style reference (e.g. a Storybook-less demo page or a design tokens file) showing the palette, type scale, and a sample table in both display and interactive modes.
- **Verify:** User reviews the style reference live and confirms it matches the textbook look and feels appropriate before any task screens are built on top of it.

### Task 1.1 — Place value table component (shared)
- Build a reusable `PlaceValueTable` component.
- Support grouping into classes (units, tens, hundreds | thousands, ten-thousands, hundred-thousands | ...).
- Support at least two modes: **display** (pre-filled, read-only) and **interactive** (accepts digit placement, e.g. drag-and-drop or click-to-place).
- **Verify:** User sees a standalone demo rendering the table in both modes with sample numbers.

### Task 1.2 — Number generator utility (shared)
- Function to generate a random natural number given: digit-count range (slider-controlled, default starting around hundred-thousands, extendable down to 2–3 digits) and a zero-inclusion toggle (on/off, not fine-grained density).
- **Verify:** User sees a small test output (e.g. console or temp UI) generating numbers under different settings and confirms zeros appear/don't appear as expected.

### Task 1.3 — Answer checking utility (shared, generic)
- Generic comparison function usable by numeric and structured answers (not yet the Hungarian text normalization — that's Task 2's concern, flag it as a stub/TODO).
- **Verify:** User confirms via a simple test case that correct/incorrect detection works.

### Task 1.4 — Scoring / session state (shared)
- Running score component: correct count, total attempted, open-ended (no fixed session length).
- **Verify:** User sees score increment/reset correctly in a throwaway test harness.

### Task 1.5 — Task 1 screen: "Build the Number"
- Wire together: number generator → target number → interactive `PlaceValueTable` → check answer on submit → immediate feedback (correct/incorrect styling) → update running score → generate new problem.
- Include the difficulty controls (digit slider + zero toggle) on this screen.
- Deploy.
- **Verify:** User plays through several rounds live on GitHub Pages and confirms difficulty controls, feedback, and scoring all work correctly.

---

## Phase 2 — Task 2: "Read the Table" (written number)

### Task 2.1 — Hungarian number-to-words + normalization utility (shared)
- Function to generate canonical Hungarian spelled-out form from digits.
- Normalization function for student text input (lowercase, strip spaces/hyphens, handle known equivalent forms e.g. "száz" vs "egyszáz").
- **Verify:** User tests a handful of known tricky inputs and confirms accepted/rejected correctly.

### Task 2.2 — Task 2 screen: "Read the Table"
- Pre-filled `PlaceValueTable` (display mode) → student types the written-out number → check via normalization utility → immediate feedback → shared scoring.
- Reuses shared table, generator, scoring components.
- Deploy.
- **Verify:** User tests live, including at least one zero-digit case and one Hungarian spelling-variant case.

---

## Phase 3 — Task 3: "Expanded Form"

### Task 3.1 — Expanded form logic
- Support both directions: number → expanded form, and expanded form → number.
- Decide and implement input format for expanded form (e.g. separate fields per place, or free text with normalization).
- **Verify:** User tests both directions live, including a number containing a zero digit (should not produce a spurious "+0" term).

---

## Phase 4 — Task 4: "Compare Two Numbers"

### Task 4.1 — Comparison task screen
- Generate two numbers, display in two tables side by side, student selects the larger (and ideally the deciding digit/position).
- Reuses shared components.
- **Verify:** User tests live with numbers of equal and differing digit counts.

---

## Phase 5 — Task 5: "Order a Set of Numbers"

### Task 5.1 — Ordering task screen
- Generate a small set of numbers (e.g. 4–5), student arranges smallest to largest (e.g. drag to reorder or click in sequence).
- **Verify:** User tests live, confirms correct/incorrect detection for partial and full orderings.

---

## Phase 6 — Task 6: "Helyi érték / Alaki érték / Valódi érték"

### Task 6.1 — Digit-value identification task screen
- Generate a number, highlight one digit, student identifies: place value (helyi érték), face value (alaki érték), and true value (valódi érték).
- **Verify:** User tests live across a few positions and digit values, including zero.

---

## Phase 7 — App Shell & Navigation

### Task 7.1 — Real navigation between tasks
- Replace the Phase 0 nav stub with working navigation between all 6 task screens.
- Shared score display persists appropriately per task (each task independent, as agreed).
- Deploy.
- **Verify:** User navigates the full live app across all six task types.

---

## Phase 8 — Polish (only after all above are verified)

### Task 8.1 — Review pass
- Cross-check styling consistency, difficulty control consistency, and mobile/tablet usability (likely classroom device).
- **Verify:** User does a final live walkthrough and signs off.

---

## Notes for the agent
- Digit-count slider default: start near hundred-thousands range per NAT2020, but allow sliding down to 2–3 digits.
- Zero toggle: simple on/off, not graduated density.
- Feedback: immediate, per-question, not batched.
- Scoring: open-ended running score, no fixed-length session.
- Each task is independently replayable; no cross-task state coupling.
- Do not skip verification steps even if a task "seems small."
