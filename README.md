# Duality — HelloWorld

A local project website for Digital Media Specialisation 1 (COMM2754), RMIT University Vietnam. The landing page presents the supplied project abstract, SDG 8 statement, Hannah Arendt quotation and publication details, the connection to SDG 8, group credits, the supplied project date, and references. The repeated SDG paragraph in the supplied text is presented once.

## Run locally

From this directory, run:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/`. VS Code Live Server also works. Use HTTP when opening the artworks because p5 loads external shader files.

## Files

- `index.html`: semantic page content and links to both existing artworks.
- `styles.css`: white and black editorial layout, responsive styles, print styles and reduced-motion support.
- `script.js`: progressively enhanced navigation highlighting. All content and links work without JavaScript.
- `LICENSE`: MIT license for the new landing-page code.
- `wu-wei/`: existing 3D generative artwork.
- `wu-wei-variation/`: existing static 2D generative artwork.

The landing page is designed for a 1920px desktop width and adapts to smaller screens. It scrolls to accommodate the supplied text. The two artworks retain their separate 1920 × 1080 stages. Artwork links open in the same tab; use the browser Back button to return.

The date `2026-11-17 01:37:00` is the supplied project timestamp (UTC+07:00), not a live clock. Reference wording and bibliographic details are supplied by the project authors; they have not been independently verified here. No analytics, external fonts, accounts or build dependencies are used.

## Authors

HelloWorld:

1. Hoang Minh Y Nguyen — s4087494
2. To Pham Chau Bao — s3891976
3. Doan Nguyen Ngoc Khanh — s4135658

Affiliation: RMIT University Vietnam, Saigon South Campus, School of Communication and Design, Digital Media Program.

## License and attribution

The MIT license applies to the newly created landing-page code (`index.html`, `styles.css`, `script.js`). It does not relicense third-party libraries, cited quotations, publications, or the existing artwork folders. Hannah Arendt's quotation and the supplied references remain attributed in the page. Existing third-party assets retain their respective licenses.

## Artwork previews

`assets/folded-matter.png` and `assets/ornamental-currents.png` are static renders made directly from the current artwork generators and fragment shaders, using a fixed seed for the landing page. They are project artwork, not stock images. The links open the actual generative pages, which produce new compositions. The landing page uses pure white and black UI, fine rules and system Baskerville/Palatino typography; gray appears within the artworks themselves.

## Typography and interface details

Display headings use the system Baskerville / Iowan Old Style / Palatino stack; body prose uses Helvetica Neue / Helvetica / Arial at 18px. Type, color and spacing tokens are declared in `:root` in `styles.css`. Directional links share a custom line arrow. A two-line divider echoes the interlacing artwork. Preview images have a readable failure state that preserves the artwork link. All original academic text and references are retained.

## Current page structure

All type now uses Helvetica Neue / Helvetica / Arial. Group information appears before the combined abstract and Arendt–SDG 8 discussion. Both existing artworks run in responsive 16:9 iframes on the landing page; no artwork links navigate away. Each external New composition button calls the embedded study’s existing `generate()` function. Use a local HTTP server for same-origin iframe access and shader loading. These notes supersede the earlier serif typography and separate-artwork-link descriptions.

## Top artwork and navigation

Art 2 now runs in the opening section instead of a static image, with only one instance on the page. Art 1 stays in the lower artwork section. The introductory note and artwork jump link have been removed. The header is sticky, and section, frame and credit-row separator rules have been removed.

## Opening-screen and narrative update

The heading and embedded Art 2 share one viewport beneath the sticky header, rather than stacking a large heading above a full-width 16:9 frame. The overall reading width is capped at 1440px. Group information precedes the selected Arendt excerpt, “a society of laborers without labor,” followed by the abstract. The abstract explicitly connects the excerpt to SDG 8, youth employment, AI, Tang Ping, Wu Wei and the two generative studies. Full publication details remain available in an expandable source section.

## Unified reading page

The selected quote and abstract now form one left-aligned section (`#perspective`, with `#project` inside it). Quote, attribution, Abstract heading, paragraphs and SDG statement share the same left edge. Desktop spacing and type are compact enough for a single Full HD reading screen; smaller screens flow vertically without clipping. Publication details remain expandable below the text.

## Wu Wei draft — 17 November 2026

The project was initially titled Wu Wei and is now titled Duality. The opening pairs the live Wu Wei I sculpture and its generated quote with project credits directly below. `?embed=transparent` removes the shader backdrop only in the landing-page embed. The standalone artwork keeps its original dark background. The next section presents SDG 8, Arendt's quote, the abstract and sources over a live Wu Wei II background (`?embed=background`, hiding its separate quote and covering the section). Both studies retain their procedural generators and regeneration buttons. This is a local draft; no deployment was requested.

## Full HD opening and rotation fix

At 1920 × 1080, the header (80px), hero (750px), and credits (250px) fit one opening screen. The SDG narrative remains below. Desktop credits use three columns; smaller screens retain vertical flow. Wu Wei I uses a longer focal length only in transparent embed mode to enlarge the object about 1.49×. Every sculpture redraw now clears color and depth before shading, so transparent missed rays no longer leave previous rotated silhouettes behind.

## Shared grid and typography

The opening uses a shared twelve-column desktop grid with a 24px gap and a single gutter token (80px at Full HD). Header, hero and credits align to the same columns; the artwork and credit body start at column 5. The title and artwork are positioned through grid alignment and section padding, replacing manual vertical translations. Embedded Wu Wei I quotes sit outside the scaled canvas stage and use the page's Helvetica Neue / Helvetica / Arial stack at 18 CSS pixels. Labels share 11px type, controls 12px, and credits 13px. These notes supersede the previous manual offsets and unequal credit columns.

## Compact reading screen and lower artwork quote

The landing artwork's instruction / New composition caption is removed. Its generated quote is anchored below the sculpture inside the transparent embed; R and drag still work in the artwork. The reading panel now spans the shared grid, with SDG 8 and the Arendt quotation in the left four columns and the complete abstract in the right eight. At Full HD the reading section targets 1000px below the 80px sticky header; spacing and typography are compact without truncating text or adding internal scroll. References follow separately. Narrower screens flow vertically.

## GitHub

Project title: **Duality**. Repository: https://github.com/aellanguyen/DUALITY. The Wu Wei philosophy and artwork study names remain part of the project content.

## Fixed Full HD presentation

The entire website now uses a fixed 1920px design width. Each main screen is 1000px tall beneath the 80px header, totaling 1920 × 1080. Smaller browser windows scale the complete design proportionally to fit; viewport-dependent reflow and short-window breakpoints have been removed. Artwork remains live and interactive. Source content and references continue below the two main screens.
