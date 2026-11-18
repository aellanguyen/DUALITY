# Duality — Website Copy

Self-contained copy of the current local website. All runtime files are in this folder; no original files were moved or changed.

## Open locally

Run `python3 -m http.server 8000` from this folder, then open http://localhost:8000/. VS Code Live Server also works. Use HTTP so p5.js can load the shader files.

## Files

- `index.html`, `styles.css`, `script.js`: supporting website, fixed 1920 × 1080 presentation.
- `generative-artwork-1.html`: interactive 3D artwork (formerly Wu Wei I). Its CSS, JavaScript and shader files use the same prefix.
- `generative-artwork-2.html`: 2D generative pattern (formerly Wu Wei II). Its dependencies use the same prefix.
- `p5.min.js`: shared local drawing library.
- `LICENSE`: existing landing-page code license. Third-party libraries and quoted content retain their respective terms.

The main page loads Artwork 1 with `?embed=transparent` and Artwork 2 with `?embed=background`. Standalone artwork pages retain their original presentation. Documentation screenshots, experiments and source explanation folders were not copied. This copy has not been committed or pushed.
