# DESIGN.md

Durable design decisions for `apps/web`. Read before building any screen.

---

## 1. Design direction

Sleek, competitive, esports-style. Board's own colors are the brand. Sharp, not playful/soft/decorated.

Priorities:
1. Prove it's live
2. AI features, equal weight
3. Shortest path to Play
4. Restrained decoration
5. Consistency across screens

---

## 2. Visual principles

- Board colors (red/yellow/blue) are the accent palette — no colors beyond token set.
- Flat surfaces, no gradients — matches sharp/competitive mood, avoids generic AI look.
- Shadow appears only on hover-lift; never static/decorative glow.
- Numbers (stats, leaderboard, difficulty) always render in mono — reinforces "live data," not copy.

---

## 3. Design tokens

Tokens live in `@workspace/ui/globals.css` (source: `packages/ui/src/styles/globals.css`). Reference
that file for exact values — don't duplicate them here.

**Colors** — brand colors are fixed across both themes, only neutrals swap dark/light:
- `primary` (red) — CTA/primary actions only, never decorative
- `secondary` (yellow) — highlights, badges, icon accents only, never a CTA
- `board-blue` — board/game-surface contexts only, never a generic UI accent
- everything else (`background`, `foreground`, `card`, `muted`, `border`, `destructive`, `success`,
  `warning`, `ring`, etc.) — semantic tokens only.

**Typography** — one role each, never swapped:
- `font-heading` (Russo One, weight 400 only) — hero/section headlines only, never below 20px
- `font-sans` (Chakra Petch, 400 body / 500–600 emphasis) — nav, buttons, body copy, cards — the default
- `font-mono` (JetBrains Mono, 400 body / 600 emphasis) — stat numbers and leaderboard figures only

**Spacing** — Tailwind default scale via utility classes. No one-off pixel values.

**Shape** — radius 6px (`rounded-md`) buttons/inputs, 8px (`rounded-lg`) cards. Pill radius
(`rounded-full`) only for difficulty chips/badges

---

## 4. Layout rules

- Container max-width 1280px, standard density.
- Mobile: collapse secondary panels below main content, preserve primary action visibility, no
  horizontal scroll.

---

## 5. Component patterns

Reuse before creating. Check what already exists first:
- `packages/ui/src/components/` — primitives (`ls` it before adding a new one; currently has button, card, badge, accordion, navigation-menu, separator, sheet)
- `packages/ui/src/icons/index.ts` — allowed icon set (Lucide re-exports; add new icons here, don't import `lucide-react` directly elsewhere)
- `apps/web/src/components/shared/` — cross-section components already built (check before duplicating)

Rules:
- One primary button per action group; secondary for supporting actions; ghost for low-priority toolbar actions.
- Destructive actions require confirmation.
- Cards group related information, not stray text. Never nest cards inside cards.
- Tables: sticky header on scroll, right-align numeric data, always define loading/empty/error states.
- New primitives added via shadcn CLI into `packages/ui/src/components/`, never hand-rolled duplicates.

---

## 6. Interaction & motion

- Duration 200–300ms, `ease-out` (or `back.out(1.2)` for scroll-triggered stagger, max ~60ms/item).
- Motion communicates state change — not decoration on every element.
- Respect `prefers-reduced-motion`.
- Every clickable element: visible hover state, 150–300ms transition, `cursor-pointer`.

---

## 7. Responsive behaviour

- Design desktop, tablet, mobile states intentionally, not just reflow.
- Wide tables become scrollable or summarised on small screens.
- Preserve action priority on smaller screens — primary CTA never buried.

---

## 8. Accessibility

- WCAG AA contrast on all text and functional elements, in both themes — light mode is verified, not assumed.
- Icon-only buttons (theme toggle, sound mute, board-teaser reset) carry `aria-label`.
- Focus ring always visible on keyboard nav — never stripped for aesthetics.
- Win/loss/threat states never rely on red/yellow alone — pair with text, icon, or position.
- Min touch target 44×44px, including board-teaser cells and nav icon buttons.

---

## 9. Anti-patterns

Avoid:
- Gradients, glassmorphism, static glow
- Radius outside 6px buttons/8px cards, or pill radius on anything but chips/badges
- Red or blue used decoratively outside CTA / board contexts
- Large decorative hero text inside product (non-landing) screens
- Raw hex colors outside the token system
- Emoji as icons
- Making every section equally visually loud
- New component when an established one already covers the case
