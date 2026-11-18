'use strict';

// GENERATOR: chooses static ink drawing rules and updates the quote/labels.
// Depends on quotes.js; shared drawing state is declared in sketch.js.
// F. SHAPE RULES AND RECENT-SHAPE MEMORY
// This separate key stores shape descriptors, not quote text or full meshes.
const historyKey='wu-wei-interlaced-flat-v6';
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
// Same makeRules -> generate -> uniforms structure as study 01.
// Here bodies describe 2D pattern neighborhoods and their black/white ink assignment.
function makeRules(entropy,excludedMode=-1){
 let state=entropy[0]^entropy[1]^entropy[2]^entropy[3];
 const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296};
 const range=(a,b)=>a+(b-a)*random();
 const balance=Array.from({length:5},()=>range(.08,.92));
 let mode=Math.floor(range(0,excludedMode<0?5:4));
 if(excludedMode>=0&&mode>=excludedMode)mode++;
 // Twelve overlapping neighborhoods cover the frame, including its edges.
 // Every neighborhood has its own seeded drawing grammar, not a copied tile.
 const count=12,roots=12;
 const bodies=[],proportions=[],orientations=[],styles=[];
 for(let i=0;i<12;i++){
  const col=i%4,row=Math.floor(i/4);
  const x=(col+.5)/4+range(-.065,.065);
  const y=(row+.5)/3+range(-.075,.075);
  // Independent black/white coverage. White paper itself is not white ink.
  bodies.push(x,y,(row+col)%2,range(.62,.94));
  proportions.push(range(.72,1.35),range(.72,1.35),Math.floor(range(2,8)),range(-.4,.4));
  orientations.push(range(-Math.PI,Math.PI),range(0,Math.PI*2),range(0,1000),range(.4,1.7));
  // Mostly open flowing bands, hatching and cellular contours; occasional radial accents.
  const choice=random();
  const family=choice<.38?3:choice<.68?4:choice<.9?1:choice<.97?0:2;
  styles.push(Math.floor(range(8,30)),range(.06,.30),range(.0012,.004),family);
 }
 const geometricCore=[range(0,1000),range(.25,.9),range(.15,.7),range(.2,.8)];
 const coreRules=[count,roots,range(.3,.95),range(.2,.9)];
 return {balance,mode,bodies,proportions,orientations,styles,geometricCore,coreRules,
  descriptor:[mode/4,count/12,roots/4,geometricCore[1],geometricCore[2],
   ...styles.filter((_,i)=>i%4===1).slice(0,4)]};
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
// Keep the generation identifier for image export.
 seed=Array.from(entropy,n=>n.toString(16).padStart(8,'0')).join('');
 currentRules=rules;
// Save only the most recent 48 fingerprints, keeping storage and comparisons bounded.
 writeHistory({recent:[...history.recent,rules.descriptor].slice(-48)});
 // Name the most pronounced opposing force after generating its geometry.
// The balance value furthest from .5 chooses the quote's theme group.
// This is a semantic link to generation settings, NOT an analysis of the final rendered image.
 let dominant=0;for(let i=1;i<rules.balance.length;i++)if(Math.abs(rules.balance[i]-.5)>Math.abs(rules.balance[dominant]-.5))dominant=i;
 const reflection=createBalanceQuote(dominant);
// No camera or motion: new rules produce one complete static drawing.
// Update the main quote.
 document.querySelector('h1').textContent='“'+reflection.text+'”';
// At startup p5 draws its own first frame; later New form actions request one redraw.
 if(sketchReady)requestRender();
 return rules;
}
