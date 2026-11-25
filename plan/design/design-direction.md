# TBC design direction

Chosen 2026-11-24: **v2, "Flora"** is the main direction. Source file: `tbc-flora_v2.html` (open it in a browser). Details get decided while the app is built.

Other files here: `tbc-glass_v1.html` is the first glass version, kept for reference. `1.jpg` to `8.jpg` are the reference images; `logo.png` is the original logo.

## Decision: dark and light together

| Where | Look |
|---|---|
| App screens (events, proposals, forms, threads) | **A. Light**: pale page, the soft glowing X form behind frosted glass panels. Long text and forms sit on near-white glass |
| Cover, landing hero, onboarding start | **B. Dark**: the same X form on black, white logo strand, mint main button |

Parked, not dropped: C (soft discs) and D (aurora) as optional backgrounds for empty states or section breaks; v1 glass.

## Rules

- **One typeface everywhere**: Hanken Grotesk (Light, Regular, Medium, Bold), including numbers and buttons. It stands in for Aeonik (the font in `4.jpg`), which is a paid font. Open decision: buy Aeonik or keep Hanken Grotesk.
- **Button rows**: every row uses the same 12px gap; buttons in a row share height and padding.
- **Colours**: black `#0B0F0D`, forest `#013F22` (main button, gloss gradient from `#127A47`), emerald `#04A56A` (shapes), mint `#69FF93` (match and highlight), green `#0B6B3E` (links), page `#F8FBF8` to `#DDEBE1`. Lime to neon gradient `#B6FF00` to `#47FF00` is for the logo only.
- **Fills only**: mint, neon and emerald are never text on the light page. Text on them is black.
- **No red anywhere.** Errors and declines use black; warnings use amber (`#7D5200` on `#FDEFC8`).
- **Logo**: original shape, lime-to-neon gradient strand plus a black strand (white strand on dark).
- **Glass**: text sits on panels at least 66% white; never text directly on the X form.
- **Motion**: respect "reduce motion".

## Not yet in Flora (from earlier experiments)

- Status symbols as the TBC knot, with the bright strand blinking (built in the glass v2 experiment, not saved). Add when status components are built.
- Dark-mode versions of the app screens (only the hero is dark for now).

## Contrast

Computed values for each pair are in the table at the bottom of `tbc-flora_v2.html`. Not measured: text placed directly on a scene.
