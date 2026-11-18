# Reading the Wu Wei code

Open `wu-wei/wu-wei-crystalline.html` with Live Server. If Live Server serves the parent `code` folder, the URL is `http://127.0.0.1:5500/wu-wei/wu-wei-crystalline.html`.

Everything this project needs is now inside one folder:

```text
wu-wei/
  wu-wei-crystalline.html      HTML: page containers and relative file links
  styles.css                  CSS: typography, layout, mobile spacing
  quotes.js                   JavaScript: English quote grammar and quote history
  generator.js                JavaScript: random sculpture settings and shape history
  sketch.js                   JavaScript: p5 setup, shader loading, rendering, mouse/buttons
  WU_WEI_CODE_GUIDE.md         This guide
  shaders/
    sculpture.vert            GLSL: the screen-filling drawing surface
    sculpture.frag            GLSL: the sculpture, symmetry, cuts, texture, lighting
  vendor/
    p5.min.js                 Third-party p5.js library; normally do not edit
```

Paths such as `./styles.css` and `./shaders/sculpture.frag` start at the HTML page's folder. You can move the entire `wu-wei` folder together without changing those internal relative links. Use a web server rather than opening the HTML through `file://`, because the shader files are loaded separately.

**JavaScript and Java are different languages.** This website uses JavaScript. There is no Python file needed to run it. `.vert` and `.frag` both contain GLSL, a language that runs on the graphics processor.

**How the files connect:** HTML loads CSS and the scripts. `sketch.js` starts p5. Its `preload()` loads the two shaders; p5 waits until they are ready. `generator.js` supplies sculpture settings, `quotes.js` supplies a reflection, and p5 passes the settings to the fragment shader to draw the image. All scripts execute locally in your browser.

**Which file should I edit?** Move or resize text in `styles.css`; change English vocabulary/templates in `quotes.js`; change random geometry ranges in `generator.js`; change symmetry/fold formulas or lighting in `sculpture.frag`; change rendering quality, camera input sensitivity, or export behavior in `sketch.js`. Usually leave `sculpture.vert` and `p5.min.js` alone.

This documentation describes what the code currently does. It does not change the sculpture, its generator, its quotes, or its rendering settings.

## 1. Four pieces working together

- **HTML** provides the containers: artwork, heading, quote, status, buttons.
- **CSS** controls where these containers sit and how the text/buttons look.
- **JavaScript** chooses the random settings, creates the quote, handles input, and calls p5.
- **GLSL** is the graphics language in `sculpture.vert` and `sculpture.frag`. The GPU runs it to calculate the image.

p5.js connects JavaScript to a WebGL canvas. It does not decide what the sculpture looks like; our generator and shader do that.

## 2. A small vocabulary

| Code | Meaning |
|---|---|
| `const name = value` | Give a value a name that will not be reassigned. |
| `let name = value` | Give a value a name that may be updated. |
| `function name(input) { ... }` | Define a reusable recipe with an input. |
| `return value` | Send a result back to whoever called the recipe. |
| `[a, b, c]` | A list, called an array. |
| `array[0]` | The first item; counting starts at zero. |
| `{ name: value }` | An object: a collection of named values. Braces also group function/if/loop instructions. |
| `for (...)` | Repeat instructions. |
| `if (...)` | Run instructions only when a condition is true. |
| `condition ? a : b` | Choose `a` if true, otherwise `b`. |
| `// ...` / `/* ... */` | A comment; the computer does not execute it. |
| `range(a,b)` | Our helper for choosing a number from `a` up to, but not including, `b`. |
| `Math.floor(x)` | Round down. `floor(range(5,11))` therefore gives integers 5–10. |
| `vec3` | A GLSL package of three numbers; often X/Y/Z coordinates or R/G/B color. |
| `uniform` | A GLSL setting supplied by JavaScript with `setUniform()`. |

The coordinate origin `[0,0,0]` is the scene center. X goes sideways, Y is vertical, Z is depth. Scene units are not pixels. Camera angles use radians, not degrees.

## 3. What happens on opening the page

1. The browser loads the local p5 library.
2. `new p5(...)` starts this sketch.
3. `p.preload()` loads the external GLSL files; `p.setup()` creates the canvas. The shader is compiled/bound for drawing.
4. `generate()` makes a new set of geometric rules and a new quote.
5. p5 calls `p.draw()` for the initial image.
6. `p.noLoop()` keeps the image still. Further redraws happen only on demand.

There is no entrance zoom, growth animation, or progressive clipping animation. A low-resolution drag preview followed by a still-quality image is a rendering-quality change, not a change to the shape.

## 4. Shape generation: `makeRules()` and `generate()`

`makeRules()` is the recipe writer. It returns a settings object; it does not draw anything.

It chooses the folded core's size, stretches, inversion threshold, expansion and rotation. It also creates 5–10 extra volumes. Some add material; some act as cutters. It chooses 3–7 window openings and a bilateral or radial symmetry rule. The arrays have space for 12 volumes and 9 openings; unused slots get radius zero.

`generate()` is the coordinator. It tries up to 128 candidates, compares their parameter fingerprints with 48 recently saved fingerprints, and takes an adequately different candidate or the best candidate found. This is parameter comparison, not computer vision. It does not guarantee that every future image will be visually unlike every previous image.

The generator uses fresh browser randomness and a deterministic 32-bit random sequence internally. The long hexadecimal ID identifies the run; there is no implemented input that replays a shape from that ID.

**Current preset implementation:** the five strings in `presets` are labels. Only `mode === 2` directly adds extra cutters and aligns their XY angles. Modes 0, 1, 3 and 4 currently share the same construction logic. These are not five independent shape algorithms.

**Current balance implementation:** `balance` contains fullness, resistance, order, mercy and light. Fullness changes window radius. All five values help select the quote theme. The other four currently do not change geometry. They do not change physical forces, lighting, or morality automatically.

## 5. How the GPU draws a 3D object without a mesh

The shader does not hold a stored list of sculpture vertices. It has mathematical functions that answer approximately: “How far is this point from the surface?”

- Positive generally means outside the volume.
- Zero means on the surface.
- Negative generally means inside the volume.

Several fields here are conservative/deformed distance estimates, not exact signed-distance functions everywhere.

For each pixel, `main()` creates a viewing ray, walks along it using these distance estimates, and stops near the first surface. This is **ray marching**. It then calculates how the surface faces the light and how surrounding material shadows it.

The four `p.vertex(...)` calls at the end form a screen-filling rectangle using two triangles. Those triangles are the canvas for the shader, not the visible triangular pattern you previously disliked.

## 6. Geometry functions

| Function | Its job |
|---|---|
| `rot()` | Rotate a pair of coordinates. |
| `merge()` | Smoothly join two distance fields. Larger blend width softens the seam. |
| `oldFoldedCore()` | The main geometric/fractal backbone: ten repeated folds, inversions, expansions and feedback steps. |
| `squaredLength()` | Despite the name, an L8 box-like norm; gives squarer profiles than ordinary circular `length()`. |
| `sculpture()` | Build one unmirrored region: core, added volumes, cuts, three-layer skins, ornament, fine relief and windows. |
| `scene()` | Reflect/repeat that entire region so the shape, cuts and details share symmetry. |
| `normal()` | Estimate which way a surface faces. |
| `ao()` | Darken creases/cavities based on nearby surrounding material. |
| `shadow()` | Trace toward the main light to detect blocking material. |
| shader `main()` | For this pixel: create a ray, march, shade, and output its final color. |

Boolean geometry is the “clipping into each other” part. Adding uses `merge()`. Subtraction uses `max(existing, -cutter)`. Intersection uses `max(existing, cutter)`. The shader supports intersection operation 2, but the current generator emits only add 0 and subtract 1.

## 7. The packed settings arrays

Each shader body gets four numbers at a time:

| Array | Four values per item |
|---|---|
| `bodies` | center X, center Y, center Z, radius |
| `proportions` | X stretch, Y stretch, Z stretch, primitive kind |
| `orientations` | XY angle, XZ angle, YZ angle, wall/tube-width ratio |
| `styles` | hardness, reserved, operation, reserved |
| `openings` | X center, Y center, radius, vertical aspect |

Primitive kinds are 0 loop, 1 solid rounded volume, 2 hollow shell, 3 rounded box. A zero radius disables an item. `styles.y` and `styles.w` are currently unused.

Per-body **hardness**, stored in `styles.x`, controls the organic-to-geometric mixture. `geometricMix` instead controls the circle-to-diamond shape of the window outlines. These similarly named ideas do not share a single global blend control.

## 8. What changes what

| Change | Find | Result |
|---|---|---|
| Bigger/smaller overall form | `const fit=1.42/bound` | Larger target makes the fitted form larger. |
| Camera framing | `cameraDistance=6.2/...` | Larger camera distance makes the object look smaller. |
| Core proportions | `coreStretch` | X width, Y height, Z depth. |
| Core character | `coreRules` | Expansion, inversion threshold, fold angle; nonlinear fractal changes. |
| Core detail depth | shader's 10-pass loop | More iterations add smaller-scale folds and cost more. The `-9` correction is linked to ten iterations. |
| Symmetry | `symmetryOrder` | 1 mirrors left/right. N=2–5 has N rotational repeats, each with mirrored half-sectors. |
| Auxiliary-volume count | `floor(range(5,11))` | Currently 5–10 volumes before reflections/repetitions. |
| Extra-volume size | `radius=range(.14,.32)` | Larger values create larger additions/cutters. |
| Geometric/organic bodies | `styles.push(...)` | Hardness near 0 is rounder; near 1 is squarer. |
| Number of windows | `holeCount=floor(range(3,8))` | Currently 3–7, before symmetry. |
| Window size | radius expression in `openings.push(...)` | Larger radius removes more material. |
| Window aspect | last opening value | Larger values make a taller opening. |
| Diamond-like windows | `geometricMix` | Higher values sharpen the circular profile toward a diamond. |
| Seam softness | `blendWidth` | Higher values blend added volumes more softly. |
| Auxiliary skin spacing | `layerSpacing` | Separation of the three skins; does not control the core's fractal iterations. |
| Auxiliary skin thickness | shader's `radius*.022` | Higher coefficient makes thicker skins. |
| Ornament density | `ornamentScale` | Higher means smaller, more numerous details. |
| Fine roughness height | `textureAmount` | Higher gives stronger displacement. |
| Fine roughness frequency | `textureFrequency` | Higher gives tighter repetition. |
| Main light direction | `vec3(-3.,5.,4.)` | Moves the light direction, not the camera or form. |
| Specular highlight | exponent `48.` | Larger is tighter; smaller is broader. |
| White/black material split | `duality` | Current value 0 keeps the material white; shadows still appear gray/black. |
| Quote position | CSS `.quote` | Desktop `top:100px`; mobile `top:96px`. |
| Quote type size | CSS `h1` | Desktop 24px; mobile 20px. |

Keep array capacities and loop counts consistent if you change them. Raising the active-body range alone cannot increase the shader's fixed 12-slot capacity.

## 9. Quote generation

`balanceLexicon` supplies 40 word pairs in five theme groups. `quoteFrames` contains 24 sentence-building functions. `quoteContexts` supplies optional endings; `quoteResponses` supplies optional second sentences.

`createBalanceQuote(theme)` chooses a pair, can reverse its order, chooses a sentence structure, and may add context and a second sentence. It checks recent pair/template use, repeated wording, length, and recent exact sentences. It stores up to 1,024 sentences locally. A safety fallback can repeat, so this is best-effort repetition avoidance, not a guarantee of infinite unique literature.

`generate()` chooses the theme corresponding to the balance number furthest from 0.5. This links the quote to settings; it does not inspect the final image. Quotes use fresh randomness separately from the shape's internal sequence. They are locally composed, original reflections, not retrieved historical quotations or model-generated text.

## 10. Rendering and interaction

`requestRender()` queues one redraw, merging repeated requests. Its `requestAnimationFrame()` call does not create a perpetual animation loop.

`setCanvasDensity()` limits the internal buffer. Still images use a maximum edge of 2,560 pixels and a budget of 3.2 million pixels. Drag previews use 1,100 pixels and 750,000 pixels. Both limits apply, along with device density and a density cap of 2.

`connectControls()` handles New form, Save image, drag rotation, R, and tab visibility. Dragging changes `angle`/`tilt`, not the geometry. Releasing restores still quality. A simple click does not trigger unnecessary preview rendering. Save renders at still quality and downloads a PNG of the canvas: the HTML quote/buttons are not part of that PNG.

`p.windowResized()` resizes the same form, uses a lighter preview while resizing, and restores still quality after 160 ms without another resize. It does not generate another quote or shape.

## 11. How to try a control on the same form

Editing a range and reloading gives you another random form, so multiple things change at once. To test a single setting on the existing form, you can use the browser's developer console:

```js
currentRules.layerSpacing = 0.22;
sketch.redraw();
```

Or:

```js
currentRules.symmetryOrder = 3;
sketch.redraw();
```

These change the current page only. Reloading discards these manual changes. To make a default permanent, edit the relevant range/value in `makeRules()` in `wu-wei/generator.js` and save that file.
