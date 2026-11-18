# Ornamental currents · study 02

A static procedural 2D pattern across the entire viewport. Open `wu-wei-crystalline.html` with Live Server. The reference informs fine black contours, organic repetition and white space; it is not traced or copied.

## Drawing rules

Twelve overlapping neighborhoods span four columns and three rows, with jittered centers and independently generated drawing rules. The coordinates fill the viewport, including the edges, without a centered fit. Each neighborhood varies its contour harmonics, skew, line weights, spacing, local bends, repeated cell shapes, interruptions and density. Open flowing bands and hatching dominate; cellular chains and occasional radial details provide accents. A spiral or central rosette is not required. This is a finite seeded procedural system, not a guarantee of literally infinite or globally unique images.

## Black, white and gray

The fragment shader accumulates two independent coverage fields. Black-only coverage is black, white-only coverage is white, their intersection is exactly neutral 50% gray, and uncovered paper is white. White paper is not white ink. Gray comes from black/white intersections, with intermediate tones at antialiased edges. The result is independent of drawing order; it is not ordinary transparency or multiply blending.

## Shared structure with study 01

Both use HTML → quotes.js → generator.js → sketch.js → GLSL, `makeRules()` / `generate()`, body/proportion/orientation/style arrays as uniforms, bounded recent-history candidate selection, p5/WebGL, on-demand rendering, resize handling and PNG export. Study 01 evaluates volumes; study 02 evaluates flat pattern coverage.

No animation, dragging or rotation. R or New composition generates another complete artwork. Save image exports the artwork without HTML text. Resize redraws the same rules. The existing `preview.png` predates these revisions and is not a current preview.

## Interlacing and flat colors

A shared curved coordinate field connects local motifs. Three continuous black ribbon spines cross three white spines across the viewport, with fine companion contours. Local ribbons extend farther and use a crisp coverage boundary instead of a broad opacity envelope. Fully covered interiors remain black, white or 50% gray. No paper-tone or ink-tone modulation is applied.

`FUZZ = 0.08` in `shaders/sculpture.frag` adds only slight subpixel contour displacement. Set to `0.0` for clean edges. There is no motion and no broad tonal fade.

## Sharpness

Static rendering uses device pixel ratio up to 2, with a 4096px longest-edge cap and an 8.4MP budget (previously 2560px / 3.2MP). Resize retains full quality. The shader uses a narrow antialiasing transition, without additional fuzzy edge widening; the remaining texture only shifts contour geometry very slightly. Extremely large displays may still reach the buffer cap.

## Minimal interface

Only the main quote overlays the artwork. Corner labels and the New / Save buttons are removed. Press R to generate a new drawing.

## Full HD layout

The current page uses a fixed 1920 × 1080 canvas at pixel density 1. A shared stage scales the canvas and quote together to fit the viewport, keeping 16:9 proportions. Window resizing changes the presentation scale, not the composition or buffer dimensions. This supersedes the earlier resolution-cap notes. Code screenshots remain snapshots of the source before this sizing update.
