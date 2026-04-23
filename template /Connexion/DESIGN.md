```markdown
# Design System Strategy: The Architectural Ledger

## 1. Overview & Creative North Star
This design system is built for G-PROM, an interface for the management of public markets at Institut 2iE. In a sector often defined by dense, utilitarian spreadsheets, we are establishing a new benchmark: **"The Architectural Ledger."**

The North Star for this system is the intersection of **institutional authority** and **modern transparency**. We move away from the "standard dashboard" look by employing high-end editorial layouts, intentional asymmetry, and a deep focus on tonal layering. Every element must feel like it has weight and purpose, avoiding the "floaty" feel of generic SaaS templates. We treat data not as a chore to be read, but as a prestigious record to be curated.

---

## 2. Color & Surface Orchestration
Our palette balances the deep, authoritative `secondary` (#1a2e44) with the refreshing, forward-thinking `primary` turquoise (#76d3c8). 

### The "No-Line" Rule
To achieve a premium, custom feel, **1px solid borders are strictly prohibited for sectioning.** 
*   **Definition through Tone:** Boundaries must be defined solely through background color shifts. For example, a `surface-container-lowest` card (#ffffff) should sit on a `surface-container-low` (#f3f3f5) section. 
*   **The Ghost Border:** If a visual anchor is required for accessibility in input fields, use a `outline-variant` token at 15% opacity. Never use 100% opaque lines.

### Surface Hierarchy & Nesting
Treat the UI as a physical desk of layered documents.
1.  **Level 0 (Global Background):** `surface` (#f9f9fb).
2.  **Level 1 (Sectioning):** `surface-container-low` (#f3f3f5). Use this for large content blocks.
3.  **Level 2 (Active Cards):** `surface-container-lowest` (#ffffff). This provides the "pop" for actionable data.
4.  **Level 3 (Interactive Elements):** `surface-bright` for hover states.

### Signature Textures & Glass
*   **The Liquidity Gradient:** For primary CTAs, do not use a flat turquoise. Use a subtle linear gradient from `primary` (#76d3c8) to `on-primary-container` (#43a399) at 135 degrees. This adds "soul" and dimension.
*   **Glassmorphism:** The Side-panel (drawer) and Topbar should utilize a semi-transparent `surface` with a 12px backdrop-blur. This ensures the application feels like a single, cohesive environment rather than fragmented boxes.

---

## 3. Typography: Editorial Authority
We utilize a high-contrast typographic scale to guide the eye through complex market data.

*   **Display & Headline (Bockhold/Manrope):** Use these for Page Titles (22px) and Stat Labels (28px). The bold weight of Bockhold conveys the weight of institutional decisions.
*   **The "Stat Highlight" Pattern:** Statistics should never just be text. They are hero elements. Use `display-sm` for numbers and `label-md` for their descriptions, ensuring a significant contrast in scale to create an editorial "rhythm."
*   **Body (Inter):** Used for all functional data. 14px is our base. Maintain a generous line height (1.5) to ensure that even dense procurement tables remain breathable.

---

## 4. Elevation & Depth
We eschew traditional "box shadows" in favor of **Ambient Occlusion.**

*   **The Layering Principle:** Depth is achieved by "stacking." A `surface-container-lowest` card (16px radius) creates its own lift when placed on a `surface-container-low` background. 
*   **Ambient Shadows:** For floating elements (like the Topbar or Hovered Cards), use an expansive, low-opacity shadow: `0 6px 24px rgba(26, 46, 68, 0.08)`. Note that the shadow color is a tinted version of our Deep Navy, not pure black.
*   **Sidebar Curvature:** The sidebar (#1a2e44) must feature a distinct 20px radius on the top-right and bottom-right edges only. This "hugs" the content area and creates a unique, non-standard silhouette.

---

## 5. Components

### Buttons & Interaction
*   **Primary:** Turquoise gradient, 10px radius. On hover, the shadow expands, and the gradient shifts slightly deeper.
*   **Secondary/Ghost:** `on-secondary-container` text on a transparent background. On hover, apply a `surface-container-high` background.
*   **Sidebar Items:** Active states should not use a box. Use a "pill" indicator (left-aligned) in turquoise and a subtle background shift for the entire row.

### The "Frosted" Side-Panel (Drawer)
Forms are never to be pop-up modals. They emerge from the right as a "Side-panel." 
*   **Styling:** Use a white background at 90% opacity with a heavy backdrop-blur (20px). 
*   **Header:** Use a `title-lg` with a bottom margin of 32px to provide breathing room before the input fields begin.

### Inputs & Fields
*   **Styling:** 10px radius. Use `surface-container-highest` as the background.
*   **States:** On focus, the background transitions to `surface-container-lowest` with a 1px `primary` ghost-border (20% opacity).

### Status Micro-Chips
Status indicators must use a "Soft-Subtle" approach:
*   **Style:** Background at 15% opacity of the status color, text at 100% opacity.
*   **Shape:** 6px radius (tighter than buttons) to distinguish them as metadata, not actions.
*   **Example (En Cours):** Background: `rgba(118, 211, 200, 0.15)`, Text: `#76d3c8`.

---

## 6. Do's and Don'ts

### Do:
*   **Use Asymmetric Padding:** Allow for "white space as a luxury." Page titles should have significantly more padding at the top (48px) than at the sides (24px) to create an editorial feel.
*   **Use Tonal Shifts:** If you need to separate two sections in a list, change the background color slightly rather than drawing a line.
*   **Prioritize Hierarchy:** The 28px Stat Labels are the most important visual anchors on the dashboard. Ensure they have room to breathe.

### Don't:
*   **No High-Contrast Borders:** Never use a dark line to separate content. It breaks the "Architectural Ledger" flow.
*   **No Pure Black Shadows:** Shadows must always be a tint of the Deep Navy (#1a2e44).
*   **No Crowded Grids:** If a table has more than 8 columns, use the Side-panel to display detail rather than cramping the main view.
*   **No Standard Icons:** Use Lucide-style outline icons with a consistent 1.5px stroke weight to match the Bockhold typography's refinement.

---

**Director's Note:** 
*Remember, G-PROM is about the stewardship of resources. The interface should feel as stable as a stone building but as clear as a glass pane. If a layout feels "busy," remove a line and add 8px of padding. Precision is our signature.*```