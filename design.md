# Design System Document: The Kinetic Editorial
 
## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Kinetic Editorial."** 
 
Tennis is a sport of precision, explosive power, and refined elegance. This system moves beyond the "standard app" aesthetic by treating the UI as a high-end digital magazine that moves with the user. We reject the rigid, boxy constraints of traditional Material Design in favor of **intentional asymmetry, hyper-rounded forms, and immersive depth**. 
 
By utilizing full-bleed imagery and sophisticated tonal layering, we create a "courtside" experience—where information doesn't just sit on a screen but exists within a physical, atmospheric space.
 
## 2. Colors: Depth over Definition
The color palette is anchored by the authority of **Royal Blue (#002366)** and the high-visibility energy of **Sporty Orange (#FF8C00)**. 
 
### The "No-Line" Rule
To maintain a premium feel, **1px solid borders are strictly prohibited** for sectioning. Boundaries must be defined through:
*   **Color Shifts:** Use a `surface-container-low` section sitting against a `surface` background.
*   **Tonal Transitions:** Define areas by the change in light, not the presence of a line.
 
### Surface Hierarchy & Nesting
Treat the UI as stacked sheets of frosted glass.
*   **Level 0 (Base):** `surface` (#faf8ff)
*   **Level 1 (Sections):** `surface-container-low` (#f4f3f9)
*   **Level 2 (Cards):** `surface-container-lowest` (#ffffff) – This provides the "pop" required for content.
 
### The "Glass & Gradient" Rule
For elements that float over sports imagery (like stats or hero titles), use **Glassmorphism**. Apply `primary-container` (#002366) at 60-80% opacity with a background blur (16px–24px).
*   **Signature Textures:** Main Action Buttons (CTAs) should use a subtle linear gradient from `secondary` (#904d00) to `secondary-container` (#fd8b00) at a 135-degree angle to create a sense of spherical volume, reminiscent of a tennis ball.
 
## 3. Typography: The Editorial Voice
We utilize a dual-font strategy to balance athletic speed with premium readability.
 
*   **Display & Headlines (Plus Jakarta Sans):** Chosen for its modern, geometric clarity. Bold weights should be used for `display-lg` to `headline-sm` to command attention, mirroring the impact of a stadium scoreboard.
*   **Body & Titles (Plus Jakarta Sans):** Used for all functional text. The generous x-height ensures readability even during quick glances.
*   **The Utility Layer (Lexend):** `label-md` and `label-sm` use Lexend to provide a technical, high-performance feel for data-heavy metrics like match scores or booking times.
 
**Hierarchy Note:** Always lead with high contrast. A `display-md` headline should be paired with a significantly smaller `body-md` to create an "Editorial" rhythm that breaks the monotony of standard layouts.
 
## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "software-heavy." We use environmental lighting.
 
*   **The Layering Principle:** Soft lift is achieved by placing a `surface-container-lowest` card on a `surface-container-high` background. The difference in luminance creates the "lift."
*   **Ambient Shadows:** If a card must float over a complex image, use a shadow tinted with the `on-surface` color at 4% opacity, with a Blur of 40px and a Y-offset of 10px. This mimics natural light.
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke (e.g., on a search bar against a white background), use `outline-variant` at **15% opacity**. It should be felt, not seen.
 
## 5. Components
 
### Buttons
*   **Primary:** High-impact `secondary-container` with a `lg` (2rem) corner radius. Use `on-secondary-container` (#603100) for text.
*   **Secondary (Action):** `primary-container` (#002366) with glassmorphism effects when placed over imagery.
*   **Tertiary:** Text-only with `label-md` styling, using an arrow icon (→) to denote kinetic movement.
 
### Cards & Lists
*   **The Rule:** No divider lines. Separate list items using `md` (1.5rem) vertical spacing or a subtle shift from `surface-container-low` to `surface-container-lowest`.
*   **Image Integration:** Cards should feature high-quality sports imagery with `DEFAULT` (1rem) corner radius. Use a `primary` gradient overlay at the bottom of images to ensure white text remains legible.
 
### Progress & Selection
*   **Date Pickers/Chips:** Use the `full` (9999px) roundedness scale. A selected state uses `tertiary-fixed` (#c3f400—a classic tennis-ball neon) to provide an unmistakable visual "ping."
*   **Booking Inputs:** Use `surface-container-high` for the input field background with no border, using `plusJakartaSans` at `title-sm` for the input text.
 
### Navigation (The Floating Dock)
The bottom navigation should not be pinned to the bottom of the screen. It should be a floating "island" using `surface-container-highest` with a `xl` (3rem) corner radius and a 20px backdrop blur.
 
## 6. Do's and Don'ts
 
### Do:
*   **Do** use asymmetrical layouts where imagery takes up 60% of the screen height.
*   **Do** use the `lg` (2rem) and `xl` (3rem) corner radii for major containers to mimic the curves of a tennis court and ball.
*   **Do** leverage "White Space" as a functional separator. If you think you need a line, you actually need more padding.
 
### Don't:
*   **Don't** use 100% black (#000000). Use `primary` (#00113a) for deep shadows and dark text to keep the palette harmonious.
*   **Don't** use sharp corners (none or sm). They feel too "corporate" and lack the aerodynamic feel of the sport.
*   **Don't** clutter the screen. If a piece of data isn't essential for the current "play," hide it behind a progressive disclosure interaction.