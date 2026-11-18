'use strict';

// QUOTES: vocabulary, sentence grammar, and local anti-repeat history.
// E. ORIGINAL ENGLISH QUOTE GENERATOR
// Original English reflections are composed locally; no quotation catalogue or API.
// Five theme groups, matching the five values in rules.balance.
// Every [a,b] is a pair of opposing/contrasting concepts; add pairs within the correct group.
const balanceLexicon=[
 [['fullness','emptiness'],['presence','absence'],['form','space'],['abundance','scarcity'],['weight','lightness'],['arrival','departure'],['holding','letting go'],['gathering','release']],
 [['yielding','resistance'],['softness','strength'],['flow','structure'],['flexibility','firmness'],['surrender','resolve'],['water','stone'],['patience','urgency'],['openness','protection']],
 [['stillness','motion'],['order','chaos'],['silence','sound'],['certainty','doubt'],['control','freedom'],['precision','chance'],['calm','turbulence'],['rhythm','surprise']],
 [['mercy','ruthlessness'],['compassion','severity'],['gentleness','force'],['tenderness','strength'],['restraint','release'],['growth','decay'],['creation','destruction'],['good','evil']],
 [['white','black'],['light','shadow'],['brightness','darkness'],['day','night'],['warmth','cold'],['visibility','concealment'],['clarity','mystery'],['dawn','dusk']]
];
// Sentence-building functions. (a,b)=>... means: take two words and return this sentence fragment.
// ${a} and ${b} inside backticks are replaced with the chosen words.
// These are templates for original reflections, not attributed quotations.
const quoteFrames=[
 (a,b)=>`${a} carries a trace of ${b}`,
 (a,b)=>`${a} finds its outline beside ${b}`,
 (a,b)=>`${a} makes room for ${b}`,
 (a,b)=>`${a} is never entirely without ${b}`,
 (a,b)=>`${a} reveals what ${b} keeps hidden`,
 (a,b)=>`${a} and ${b} give each other meaning`,
 (a,b)=>`${a} begins where ${b} loosens its hold`,
 (a,b)=>`${a} leaves a little space for ${b}`,
 (a,b)=>`${a} changes the way we see ${b}`,
 (a,b)=>`${a} holds the possibility of ${b}`,
 (a,b)=>`${a} is one way of listening to ${b}`,
 (a,b)=>`${a} deepens in the presence of ${b}`,
 (a,b)=>`${a} and ${b} meet without becoming the same`,
 (a,b)=>`${a} gives ${b} something to answer`,
 (a,b)=>`${a} and ${b} belong to one unfolding whole`,
 (a,b)=>`${a} returns us to the question of ${b}`,
 (a,b)=>`${a} does not erase ${b}; it gives it another shape`,
 (a,b)=>`${a} keeps a doorway open to ${b}`,
 (a,b)=>`${a} and ${b} share an unfinished boundary`,
 (a,b)=>`${a} becomes visible through its encounter with ${b}`,
 (a,b)=>`${a} has something to learn from ${b}`,
 (a,b)=>`${a} turns, and ${b} comes into view`,
 (a,b)=>`${a} and ${b} shape the space between them`,
 (a,b)=>`${a} holds one edge of what ${b} completes`
];
// Optional contextual endings. Empty string means "add no context".
const quoteContexts=[
 '', ' within a changing world',' in the space between things',' as the world unfolds',
 ' at the edge of change',' beneath the surface',' in the rhythm of becoming',
 ' beyond the first impression',' within a single form',' through every quiet change'
];
// Optional second sentences; the generator tries adding one on 1 out of 4 attempts.
const quoteResponses=[
 'Balance leaves room for both.',
 'Neither needs to fill the whole.',
 'Their meeting is always changing.',
 'The space between them is alive.',
 'One form can hold more than one truth.',
 'Harmony still has room for difference.',
 'A boundary can also be a meeting place.',
 'What remains open can still become.',
 'The whole is wider than either side.',
 'Nothing has to stand alone.',
 'Even an edge can become an opening.',
 'Balance is a relationship, still unfolding.',
 'Each carries a little of the other.',
 'There is room to meet without agreeing.',
 'What holds can also learn to yield.',
 'The answer keeps changing with the light.'
];
// A storage key is a label for saved browser data. Changing it starts a fresh quote history.
// localStorage normally survives browser restarts; sessionStorage lasts within the tab session.
// If browser storage is blocked, quoteMemory works until the page is reloaded.
const quoteHistoryKey='folded-matter-original-quotes-v1';
let// Remember up to 1,024 full sentences, and 12 recent pair/template IDs.
// Writes are local to this browser/origin; nothing is uploaded to a server.
 quoteMemory={texts:[],pairs:[],frames:[]};
// Read persistent quote history first, then fall back to the in-memory copy.
function readQuoteHistory(){
 for(const name of ['localStorage','sessionStorage'])try{
  const h=JSON.parse(globalThis[name].getItem(quoteHistoryKey));
  if(h&&Array.isArray(h.texts)&&Array.isArray(h.pairs)&&Array.isArray(h.frames))return h;
 }catch(e){}
 return quoteMemory;
}
// Build one short English reflection for theme index 0..4.
function createBalanceQuote(theme){
 const h=readQuoteHistory();
// Pick an unbiased integer in [0,n). crypto supplies fresh randomness, independent of shape rules.
// Rejecting the small excess at the end of the 32-bit range avoids modulo bias.
 const pick=n=>{
  const limit=Math.floor(4294967296/n)*n;
  let v;
  do{v=crypto.getRandomValues(new Uint32Array(1))[0]}while(v>=limit);
  return v%n
 };
// Capitalize only the first character of the generated sentence.
 const capital=s=>s.charAt(0).toUpperCase()+s.slice(1);
 let result;
// Try up to 256 candidates, so anti-repeat rules cannot create an endless loop.
 for(let attempt=0;attempt<256;attempt++){
  const pool=balanceLexicon[theme],pairIndex=pick(pool.length),pair=pool[pairIndex];
  const pairId=theme+':'+pairIndex;
// Prefer not reusing the last three pairs or last four sentence templates.
  if(h.pairs.slice(-3).includes(pairId)&&attempt<240)continue;
  const frame=pick(quoteFrames.length);
  if(h.frames.slice(-4).includes(frame)&&attempt<240)continue;
// Randomly reverse which side of the pair appears first; this is not tied to visual brightness.
  const [a,b]=pick(2)?pair:[...pair].reverse();
  let sentence=capital(quoteFrames[frame](a,b));
  const context=pick(quoteContexts.length);
  const contextText=quoteContexts[context];
// Avoid awkward repetition such as "space between them in the space between things".
  const repeatedImage=['space','world','form','chang','light','edge','surface','rhythm','unfold','becom','quiet'].some(word=>sentence.toLowerCase().includes(word)&&contextText.includes(word));
// About one-third of eligible nonempty contexts are added; keep the first sentence short.
  if(context&&pick(3)===0&&!repeatedImage&&sentence.length+contextText.length<122)sentence+=contextText;
  sentence+='.';
  if(pick(4)===0){
   const response=quoteResponses[pick(quoteResponses.length)];
// Keep the result short enough for the top-center quote area. These limits count characters.
   if(sentence.length+response.length<172)sentence+=' '+response;
  }
// Exact recent sentences are rejected even if the same words/template could produce them again.
  if(h.texts.includes(sentence))continue;
  result={text:sentence,label:pair.join(' / ').toUpperCase(),pairId,frame};break;
 }
 // Exhausting the recent window should not prevent a new form from rendering.
// Safety fallback after too many rejected candidates. This fallback is not guaranteed unique.
// Therefore the practical anti-repeat guarantee is best-effort, not mathematical infinity.
 if(!result){
  const pair=balanceLexicon[theme][pick(balanceLexicon[theme].length)];
  result={text:capital(pair[0])+' and '+pair[1]+' leave room for what comes next.',label:pair.join(' / ').toUpperCase(),pairId:theme+':fallback',frame:-1};
 }
 quoteMemory={texts:[...h.texts,result.text].slice(-1024),pairs:[...h.pairs,result.pairId].slice(-12),frames:[...h.frames,result.frame].slice(-12)};
 for(const name of ['localStorage','sessionStorage'])try{globalThis[name].setItem(quoteHistoryKey,JSON.stringify(quoteMemory))}catch(e){}
 return result;
}
