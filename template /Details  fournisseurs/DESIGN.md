# Design System Strategy: The Sovereign Archive

## 1. Overview & Creative North Star
Public procurement ("Gestion des Marchés Publics") is an exercise in authority, transparency, and meticulous organization. To move beyond the generic "SaaS dashboard" look, this design system adopts the Creative North Star of **"The Sovereign Archive."**

This aesthetic rejects the cluttered grid of traditional B2B software in favor of an editorial, high-end experience. We treat data as a curated collection. By utilizing intentional asymmetry, overlapping layers, and high-contrast typography, we create an environment that feels authoritative yet breathable. We are not just building a database; we are building a digital institution.

## 2. Color Strategy
Our palette is anchored in professional blues and clean surfaces, but the execution must be sophisticated.

### Tonal Hierarchy
*   **Background (`#F4F6F9`):** Our canvas. It provides a cool, neutral base that allows white surfaces to "pop" without harsh contrast.
*   **Primary Blue (`#1A3F6F`):** The color of command. Reserved for the Sidebar and Primary CTAs.
*   **Surface Hierarchy:**
    *   **Surface (`#FFFFFF`):** The primary content area.
    *   **Surface-Container-Low:** Used for secondary grouping or background sections.
    *   **Surface-Container-Lowest:** The "Elevated" white, used for floating cards.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning. 
Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section sitting on a `surface` background creates a natural edge. This forces a cleaner, more modern interface that relies on geometry rather than wireframes.

### The Glass & Gradient Rule
To provide visual "soul," primary elements should not be flat.
*   **Signature Textures:** Use subtle linear gradients on the Sidebar (Primary Blue `#1A3F6F` to Secondary Blue `#1E4D8C`) at a 135° angle.
*   **Glassmorphism:** For floating menus or status overlays, use semi-transparent white (e.g., `rgba(255, 255, 255, 0.7)`) with a `backdrop-blur: 12px`. This makes the UI feel integrated and premium.

## 3. Typography: The Editorial Scale
We use **Inter** to achieve a balance between technical precision and modern readability.

*   **Display & Headlines:** Use `display-md` (2.75rem) for main dashboard headings. Reduce letter-spacing to `-0.02em` for a tighter, more authoritative "editorial" feel.
*   **Body Text:** Use `body-md` (0.875rem) for general content to maximize data density without sacrificing legibility.
*   **Labels:** Use `label-md` (0.75rem) in All-Caps with `+0.05em` letter-spacing for metadata and form headers. This distinguishes "Instructional" text from "Data" text.

## 4. Elevation & Depth: Tonal Layering
Depth is achieved through "stacking" rather than traditional drop shadows.

*   **The Layering Principle:** Place a `surface-container-lowest` card on top of a `surface-container-low` background. This creates a soft, structural lift that feels architectural.
*   **Ambient Shadows:** When a card requires a "floating" effect (Radius: `xl` / 16px), use a shadow tinted with the primary blue: `0px 12px 32px rgba(26, 63, 111, 0.06)`. This mimics natural light reflecting off a cool surface.
*   **The Ghost Border:** If a border is required for accessibility in input fields, use the `outline_variant` token at **20% opacity**. Never use 100% opaque, high-contrast borders.

## 5. Components

### Sidebar
*   **Base:** Primary Blue `#1A3F6F`.
*   **Interaction:** Active states should use a subtle "inset" glow or a `surface_tint` indicator, never a bright contrasting color. Icons and text must remain high-contrast White.

### Buttons
*   **Height:** Fixed at 40px for consistency.
*   **Primary:** Background `#1A3F6F`, Radius `md` (8px). Apply a very subtle top-inner-shadow (white at 10% opacity) to give the button a "pressed" high-end feel.
*   **Secondary:** No background. Use a "Ghost Border" (Primary at 20% opacity) and Primary Blue text.

### Badges (Pills)
*   **Form:** Fully rounded (`radius-full`).
*   **Styling:** Use a "Tonal Match" system. 
    *   *Success:* Background `green-100`, Text `Success Green #1E7A4E`.
    *   *Error:* Background `red-100`, Text `Error Red #C0392B`.
    *   Do not use heavy, dark backgrounds for badges; they should feel like highlights, not buttons.

### Forms & Inputs
*   **Layout:** Label (Label-MD, Uppercase) sits exactly 8px above the input.
*   **Input Field:** Height 40px, Radius `sm` (4px). Background should be `surface-container-low`. 
*   **Focus State:** Shift background to `surface` and apply a 2px "Ghost Border" in Primary Blue.

### Cards & Lists
*   **Rule:** Forbid the use of divider lines between list items. 
*   **Separation:** Use 16px of vertical white space (from the 8pt grid) or alternate background colors (`surface` vs `surface-container-low`) to separate line items. This keeps the "Sovereign Archive" looking clean and expansive.

## 6. Do’s and Don’ts

### Do
*   **Do** use the 8pt grid for every margin and padding (8, 16, 24, 32, 48, 64).
*   **Do** use whitespace as a functional tool to group related data.
*   **Do** ensure all interactive elements have a clear `on-surface` or `primary` state change.
*   **Do** use asymmetrical layouts for headers—e.g., Title on the far left, Action buttons grouped on the far right with a large gap between.

### Don’t
*   **Don’t** use pure black `#000000` for text; use `on_surface` (`#191C1E`) to maintain a premium, soft look.
*   **Don’t** use default browser shadows or heavy 1px borders.
*   **Don’t** crowd the screen. If the data is dense, use "Surface Nesting" to create hierarchy rather than cramming elements together.
*   **Don’t** mix border radii. Stick to the scale: `sm` for inputs, `lg` for cards, `full` for badges.