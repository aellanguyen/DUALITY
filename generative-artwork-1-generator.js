'use strict';

// GENERATOR: chooses sculpture rules and updates the quote/labels.
// Depends on quotes.js; shared drawing state is declared in sketch.js.
// F. SHAPE RULES AND RECENT-SHAPE MEMORY
// This separate key stores shape descriptors, not quote text or full meshes.
const historyKey='folded-matter-symmetry-v7';
let memoryHistory={recent:[]};
// Read previous geometric fingerprints so a refresh can avoid similar recent parameters.
function readHistory(){
 for(const name of ['localStorage','sessionStorage'])try{
  const value=JSON.parse(globalThis[name].getItem(historyKey));
  if(value&&Array.isArray(value.recent))return value;
 }catch(e){}
 return memoryHistory;
}
// Save the fingerprint list locally, with memory fallback if storage is unavailable.
function writeHistory(value){
 memoryHistory=value;
 for(const name of ['localStorage','sessionStorage'])try{globalThis[name].setItem(historyKey,JSON.stringify(value))}catch(e){}
}
// Presets constrain construction rules; every body graph is generated from scratch.
// IMPORTANT: these names are labels, not five separate completed 3D models.
// In the current implementation, only mode===2 directly changes the construction logic:
// it adds more cutters and aligns their XY rotation to zero.
// Modes 0,1,3,4 share the same generator; their different names do NOT add separate formulas.
const presets=['FOLDED CORE','INTERSECTING SHELLS','AXIAL CLIPPING','NESTED GATES','RADIAL FOLDS'];
// Generate one candidate settings object. Nothing is drawn here.
// entropy = four random 32-bit numbers; excludedMode = the previous mode to avoid immediately repeating.
// range(min,max) below returns a number from min up to (but not including) max.
function makeRules(entropy,excludedMode=-1){
// Combine four random words with XOR, then use a small deterministic random-number generator.
// Its internal state is 32-bit: the much longer displayed ID is not 128-bit geometric variety.
// There is no built-in seed-replay UI, nor a promise that all future shapes are globally unique.
 let state=entropy[0]^entropy[1]^entropy[2]^entropy[3];
 const random=()=>{
  state=(Math.imul(state,1664525)+1013904223)>>>0;
  return state/4294967296
 };
 const range=(a,b)=>a+(b-a)*random();
// Five random "balance" numbers, in this order:
// fullness, resistance, order, mercy, light.
// PRECISE CURRENT BEHAVIOR: fullness changes hole size below. The other four do not
// currently alter the geometry; all five help choose the quote theme in generate().
// These names express the artistic concept, not an automatic physical/ethical simulation.
 const balance=Array.from({length:5},()=>range(.08,.92));
 const [fullness,resistance,order,mercy,light]=balance;
// Choose a mode while excluding the previous one; Math.floor removes the fractional part.
 let mode=Math.floor(range(0,excludedMode<0?presets.length:presets.length-1));
 if(excludedMode>=0&&mode>=excludedMode)mode++;
// 48% chance of bilateral mirroring. Otherwise choose rotational order 2,3,4 or 5.
// To force bilateral symmetry for testing, replace this whole expression with 1.
 const symmetryOrder=random()<.48?1:Math.floor(range(2,6));
 // Keep the old folded visual as the backbone of every composition.
// [x,y,z,size]. This core is enabled in EVERY generated sculpture, preserving the old visual.
 const geometricCore=[0,0,0,range(.65,.88)];
// Random core controls: expansion (-2.02..-1.70), inversion threshold (.36...60),
// fold rotation (.008...14 radians), offset 0. Effects are nonlinear; small changes can be dramatic.
 const coreRules=[range(-2.02,-1.70),range(.36,.60),range(.008,.14),0];
// Independent X/Y/Z stretch ranges: wider, taller and deeper variations of the same core.
 const coreStretch=[range(.82,1.20),range(.82,1.30),range(.72,1.08)];
// Flat number lists: push four values per GPU slot, matching the uniform layout in section D.
 const bodies=[],proportions=[],orientations=[],styles=[];
// geometricMix (.70...94) mostly favors diamond-like HOLES.
// count=floor(range(5,11)) means 5..10 active auxiliary bodies, before mirroring/repetition.
 const geometricMix=range(.70,.94),count=Math.floor(range(5,11));
 for(let i=0;i<12;i++){
// Pad unused slots to the fixed array size. Radius 0 makes the shader skip them.
  if(i>=count){bodies.push(0,0,0,0);proportions.push(1,1,1,1);orientations.push(0,0,0,0);styles.push(0,0,0,0);continue}
// Place bodies in a positive-angle wedge; the shader mirrors/repeats this wedge later.
  const a=range(.06,Math.PI*.44),reach=range(.18,.62);
  const center=[Math.cos(a)*reach,Math.sin(a)*reach,range(-.34,.28)];
// Auxiliary body sizes BEFORE the overall fit-to-screen scaling below.
  const radius=range(.14,.32);
// Every third body is a loop; others are mostly rounded boxes, otherwise hollow shells.
  const kind=i%3===0?0:(random()<.65?3:2);
// Bodies #1 and #3 are cutters. Mode 2 adds cutters at indices 2,5,8,...
// These Boolean subtractions create interlocking voids; they are not camera near-plane clipping.
  const cut=i===1||i===3||(mode===2&&i%3===2);
  bodies.push(...center,radius);
// Stretch ranges and kind code. Cutters use solid kind 1, whatever their original decorative kind.
  proportions.push(range(.7,1.4),range(.7,1.5),range(.7,1.3),cut?1:kind);
// Mode 2 aligns XY cuts; other modes rotate them. XZ/YZ rotations remain randomized.
  const angle=mode===2?0:range(-.65,.65);
  orientations.push(angle,range(-.7,.7),range(-.4,.4),range(.07,.16));
// Hard/soft contrast per body: every third is softer (.18...40), others harder (.72...96).
// Operation is 1 for a cutter and 0 for an added volume. Operation 2 is unused here.
  styles.push(i%3===0?range(.18,.4):range(.72,.96),1,cut?1:0,0);
 }
 const openings=[];
// 3..7 active individually placed windows; 9 slots are sent to the GPU.
 const holeCount=Math.floor(range(3,8));
 for(let i=0;i<9;i++){
  const a=range(.05,Math.PI*.48),reach=i===0?range(.03,.16):range(.20,.58);
// First opening is near the center; others are farther out.
// More fullness reduces the radius multiplier, leaving more material around the openings.
  openings.push(Math.cos(a)*reach,Math.sin(a)*reach,i<holeCount?range(.065,.18)*(1.15-fullness*.25):0,range(.75,1.45));
 }
// Estimate an overall size for framing. This is a fitting heuristic, not a clipping plane.
 const coreBound=geometricCore[3]*Math.max(...coreStretch)*1.45;
 let bound=coreBound;
 for(let i=0;i<48;i+=4)if(bodies[i+3]>0&&styles[i+2]===0)bound=Math.max(bound,Math.hypot(...bodies.slice(i,i+3))+bodies[i+3]*Math.max(...proportions.slice(i,i+3)));
// TARGET SIZE CONTROL: 1.42 sets the intended spatial footprint.
// Larger => bigger sculpture; smaller => smaller sculpture. Camera distance also changes apparent size.
 const fit=1.42/bound;
 geometricCore[3]*=fit;for(let i=0;i<48;i++)bodies[i]*=fit;
 for(let i=0;i<36;i+=4){openings[i]*=fit;openings[i+1]*=fit;openings[i+2]*=fit}
// Return geometry, detail settings and a compact geometric fingerprint; still no drawing.
 return {balance,mode,bodies,proportions,orientations,styles,openings,geometricCore,coreRules,coreStretch,geometricMix,symmetryOrder,
// Global detail controls: seam smoothing; fine displacement height; fine displacement frequency;
// three-skin spacing; ornament density; material split (0 = white throughout).
  blendWidth:range(.006,.018),textureAmount:range(.0008,.002),textureFrequency:range(55,90),layerSpacing:range(.12,.19),ornamentScale:range(.8,1.2),duality:0,
// A normalized parameter fingerprint, not an image comparison or a perceptual similarity model.
// Similar settings can look different; different fingerprints can still look visually similar.
  descriptor:[mode/4,symmetryOrder/5,count/12,geometricCore[3],...coreStretch,(-coreRules[0]-1.7)/.32,coreRules[1],holeCount/9,geometricMix]};
}
// NEW FORM WORKFLOW: select candidate rules -> save fingerprint -> make quote -> update text
// -> ask p5 to render once. Called at startup, by New form, and by the R key.
function generate(){
 const history=readHistory();let rules,entropy,bestRules,bestEntropy,bestDistance=-1;
 const lastDescriptor=history.recent[history.recent.length-1];
// The first descriptor value stored mode/4, so multiply by 4 to recover the previous mode.
 const excludedMode=lastDescriptor?Math.round(lastDescriptor[0]*4):-1;
 // Compare geometry distributions, and retain the furthest candidate if history is crowded.
// Maximum 128 candidates bounds CPU work. The furthest candidate is retained as a fallback.
 for(let attempt=0;attempt<128;attempt++){
  entropy=crypto.getRandomValues(new Uint32Array(4));rules=makeRules(entropy,excludedMode);
  const distance=history.recent.reduce((nearest,old)=>{
   if(!Array.isArray(old)||old.length!==rules.descriptor.length)return nearest;
// Root-mean-square difference between fingerprints: a small number means similar parameters.
   const value=Math.sqrt(rules.descriptor.reduce((sum,v,i)=>sum+(v-old[i])**2,0)/rules.descriptor.length);
   return Math.min(nearest,value);
  },Infinity);
  if(distance>bestDistance){bestDistance=distance;bestRules=rules;bestEntropy=entropy}
// Stop searching once the nearest recent fingerprint is more than .115 away.
  if(distance>.115)break;
 }
 rules=bestRules;entropy=bestEntropy;
// Join four random words into a hexadecimal identifier; only its first 12 characters are displayed.
 seed=Array.from(entropy,n=>n.toString(16).padStart(8,'0')).join('');
 currentRules=rules;
// Save only the most recent 48 fingerprints, keeping storage and comparisons bounded.
 writeHistory({recent:[...history.recent,rules.descriptor].slice(-48)});
 // Name the most pronounced opposing force after generating its geometry.
// The balance value furthest from .5 chooses the quote's theme group.
// This is a semantic link to generation settings, NOT an analysis of the final rendered image.
 let dominant=0;for(let i=1;i<rules.balance.length;i++)if(Math.abs(rules.balance[i]-.5)>Math.abs(rules.balance[dominant]-.5))dominant=i;
 const reflection=createBalanceQuote(dominant);
// Reset the camera for this new form: frontal view with a small vertical tilt.
 angle=0;tilt=.03;
// Fill the quote using the generated sentence.
 document.querySelector('h1').textContent='“'+reflection.text+'”';
// At startup p5 draws its own first frame; later New form actions request one redraw.
 if(sketchReady)requestRender();
 return rules;
}
