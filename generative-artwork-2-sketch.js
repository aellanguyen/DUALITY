/*
PAGE ENTRY POINT (JavaScript, not Java).
Load order in generative-artwork-2.html:
1. vendor/p5.min.js — the drawing library
2. quotes.js — shared English quote generation
3. generator.js — random ornamental loop settings
4. sketch.js — this file: canvas, shader loading, interaction, and render scheduling

The mathematical ink drawing lives in shaders/sculpture.frag (GLSL).
Page appearance lives in generative-artwork-2.css. No Python is required by this website.
Run the HTML through Live Server or another local web server, because p5 loads
shader files over HTTP. Double-clicking the HTML as file:// may block those loads.
*/
'use strict';

// C. SHARED STATE
// sketch: the p5 instance; renderer: p5's canvas wrapper; canvas: the actual HTML canvas.
// surfaceShader: our GPU program. sketchReady prevents redraw requests during setup.
let sketch,renderer,canvas,surfaceShader,sketchReady=false;
// seed identifies the composition; currentRules holds its complete drawing grammar.
let seed,currentRules;
// G. ON-DEMAND RENDERING / PERFORMANCE
let renderFrame=0;
// Coalesce many input events into one browser-frame redraw.
// requestAnimationFrame here is a one-shot scheduler, NOT a continuous appearance animation.
function requestRender(){
// Skip duplicate requests, setup-time requests and work for a hidden tab.
 if(renderFrame||!sketchReady||document.hidden)return;
 renderFrame=requestAnimationFrame(()=>{renderFrame=0;if(!document.hidden)sketch.redraw()});
}
const ARTWORK_WIDTH=1920,ARTWORK_HEIGHT=1080;
function fitStage(){
 const fit=new URLSearchParams(location.search).get('embed')==='background'?Math.max:Math.min;
 const scale=fit(innerWidth/ARTWORK_WIDTH,innerHeight/ARTWORK_HEIGHT);
 document.querySelector('#stage').style.setProperty('--stage-scale',scale);
}
function setCanvasDensity(p){
 // Exact Full HD drawing buffer, independent of display size or pixel ratio.
 if(p.pixelDensity()!==1)p.pixelDensity(1);
}
fitStage();

// Static artwork: R, resize and visibility can request a render.
function connectControls(p){
// R = a new form; ignore this shortcut while a button is the keyboard target.
 addEventListener('keydown',e=>{if(e.target.tagName!=='BUTTON'&&e.key.toLowerCase()==='r')generate()});
// Cancel queued GPU work while hidden; refresh the current image when returning to the tab.
 document.addEventListener('visibilitychange',()=>{
  if(document.hidden&&renderFrame){cancelAnimationFrame(renderFrame);renderFrame=0}
  else if(!document.hidden)requestRender();
 });
}
// H. P5 LIFECYCLE
// Instance mode: p is this sketch's p5 object; p.setup and p.draw are callbacks p5 invokes.
// Keeping the sketch in its own instance avoids defining page-global setup()/draw() functions.
new p5(p=>{
 sketch=p;
 // p5 waits for both external GLSL files before calling setup().
 // These paths are relative to the HTML page, not to this JavaScript file.
 p.preload=()=>{
  surfaceShader=p.loadShader('./generative-artwork-2.vert','./generative-artwork-2.frag');
 };
// Runs once after the library/page are ready.
 p.setup=()=>{
// WebGL 1 matches the shader syntax. preserveDrawingBuffer keeps the finished pixels
// available for PNG export. antialias:false disables hardware MSAA (contour antialiasing is per-pixel).
  p.setAttributes({version:1,antialias:false,preserveDrawingBuffer:true});
  setCanvasDensity(p);
// Create a viewport-sized WEBGL canvas, then insert it into the #artwork container.
  renderer=p.createCanvas(ARTWORK_WIDTH,ARTWORK_HEIGHT,p.WEBGL);
  renderer.parent('artwork');canvas=renderer.elt;
  canvas.setAttribute('aria-label','Static full-screen black and white pattern of flowing bands, hatching and irregular cells. Black and white ink intersections are gray.');
// The p5 shader was loaded in preload(); it is compiled/bound when used for drawing.
// No mesh outlines. noLoop() stops continuous drawing; p5 still produces its initial frame.
// Later calls to redraw() render exactly when input/new geometry/resize requires it.
  p.noStroke();p.noLoop();
  connectControls(p);generate();sketchReady=true;
 };
// Render the current settings. This function does not choose a new shape or quote.
 p.draw=()=>{
  if(!currentRules)return;
  p.shader(surfaceShader);
// Send the actual buffer dimensions so the per-pixel ray calculation has the right aspect ratio.
  surfaceShader.setUniform('resolution',[p.drawingContext.drawingBufferWidth,p.drawingContext.drawingBufferHeight]);
// Upload shape settings; p5 handles WebGL uniform calls and caches unchanged values.
  for(const name of ['bodies','proportions','orientations','styles','geometricCore','coreRules'])surfaceShader.setUniform(name,currentRules[name]);
// A four-corner screen-filling quad is submitted as two triangles.
// These triangles are only the shader's drawing surface: they are NOT the sculpture's geometry.
// Removing them removes the entire rendered image, even if you dislike triangular visual patterns.
  p.beginShape(p.TRIANGLE_STRIP);
  p.vertex(-1,-1,0);
  p.vertex(1,-1,0);
  p.vertex(-1,1,0);
  p.vertex(1,1,0);
  p.endShape();
 };
// Handle viewport resizing without regenerating the shape or quote.
 p.windowResized=()=>{fitStage()};
},'artwork');
