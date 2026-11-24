// A static 2D drawing grammar. The shared study-01 pipeline sends rules as uniforms.
// No time, camera, animation, lighting, meshes or reference-image tracing.
precision highp float;
uniform vec2 resolution;
uniform float metallicShading;
uniform vec4 bodies[12],proportions[12],orientations[12],styles[12];
uniform vec4 geometricCore,coreRules,weave;
const float TAU=6.28318530718;
mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
float hash(float n){return fract(sin(n*127.1+geometricCore.x)*43758.5453);}
// Subtle, static paper/ink texture. Set to 0.0 for the clean version.
const float FUZZ=0.08;
float paperHash(vec2 p){
 return fract(sin(dot(p,vec2(127.1,311.7))+geometricCore.x)*43758.5453);
}
float paperNoise(vec2 p){
 vec2 cell=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(paperHash(cell),paperHash(cell+vec2(1.,0.)),f.x),
  mix(paperHash(cell+vec2(0.,1.)),paperHash(cell+vec2(1.,1.)),f.x),f.y);
}
float ink(float d,float width,float aa){
 float feather=aa;
 return 1.-smoothstep(width-feather,width+feather,abs(d));
}
// Harmonics alter curvature and asymmetry at several scales, not just position.
float outline(float a,float phase,float frequency,float warp){
 return 1.+warp*sin(a*frequency+phase)
  +warp*.43*sin(a*(frequency+1.)-phase*1.7)
  +warp*.19*cos(a*(frequency+4.)+phase*.6);
}
float drawing(vec2 p,float radius,vec4 shape,vec4 turn,vec4 style,float aa){
 // Open, irregular ribbons and hatching replace obligatory circular construction.
 if(style.w>2.5){
  float wave=sin(p.x/radius*shape.z*.65+turn.y)*radius*style.y;
  wave+=sin(p.x/radius*2.3-turn.y)*radius*.12;
  float y=p.y-wave-shape.w*p.x;
  // Clip at an actual boundary; never fade coverage across a broad envelope.
  float band=radius*(.10+.08*sin(p.x/radius*2.+turn.y));
  float result=0.;
  for(int j=-3;j<=3;j++){
   float f=float(j),spacing=radius*(style.w>3.5?.24:.33);
   float bend=sin(p.x/radius*(2.+hash(f+turn.z)*3.)+turn.y+f)*radius*.065;
   float distance=y-f*spacing+bend;
   float width=style.z*(.65+hash(f+turn.z));
   // Alternate broad filled ribbons and fine lines; these are real coverage areas.
   if(style.w<3.5&&j==0)width=band;
   result=max(result,ink(distance,width,aa));
   if(style.w>3.5){
    float cross=p.x+sin(p.y/radius*3.+turn.y)*radius*.18;
    result=max(result,ink(cross-f*spacing,style.z*.6,aa));
   }
  }
  float boundary=max(abs(p.x)-radius*2.3,abs(p.y)-radius*1.45);
  return min(result,1.-smoothstep(-aa,aa,boundary));
 }
 float a=atan(p.y,p.x),d=length(p),n=style.x;
 float path=radius*outline(a,turn.y,shape.z,style.y);
 float weight=style.z*(.7+.3*sin(a*3.+turn.y));
 float result=ink(d-path,weight,aa);
 // Partial solid contour bands give white and black regions area to intersect.
 float broad=radius*(.025+.06*hash(turn.z));
 if(sin(a*shape.z+turn.y)>.3)
  result=max(result,ink(d-path+broad,broad,aa));
 // A varying number of offset contours; open sections create loose ink tendrils.
 for(int j=1;j<=3;j++){
  float f=float(j);
  float offset=radius*(.04+geometricCore.z*.10)*f;
  float gate=sin(a*(1.+floor(turn.w*2.))+turn.y+f);
  if(f<1.+geometricCore.y*4.&&gate>-.55)
   result=max(result,ink(d-path-offset,weight*.55,aa));
 }
 if(style.w<.5)return result;
 float sector=TAU/n;
 float index=floor((a+3.14159265359)/sector);
 // Per-cell randomness changes length, width, curl and missing-cell rhythm.
 float rnd=hash(index+turn.z),rnd2=hash(index*2.31+turn.z+17.);
 float local=mod(a+3.14159265359,sector)-sector*.5;
 float centerAngle=(index+.5)*sector-3.14159265359;
 float center=radius*outline(centerAngle,turn.y,shape.z,style.y);
 float tangent=local*center;
 float radial=d-center;
 float cellWidth=radius*sector*(.25+.20*rnd);
 float cellHeight=radius*(.035+.12*rnd2)*turn.w;
 // Chains form uneven hollow cells along a meandering boundary.
 if(style.w<1.5){
  vec2 q=vec2(tangent,radial+sin(local/sector*3.14)*cellHeight*.25);
  q.x+=shape.w*q.y;
  float edge=(length(q/vec2(cellWidth,cellHeight))-1.)*min(cellWidth,cellHeight);
  if(rnd>geometricCore.w*.18){
   result=max(result,ink(edge,weight*.8,aa));
   if(rnd2>coreRules.z)result=max(result,ink(edge+cellHeight*.23,weight*.5,aa));
  }
 }else{
  // Radial grammar: individual lobes can stretch, bend, split or disappear.
  float reach=radius*(.15+.65*rnd2);
  vec2 q=vec2(tangent+(radial*radial/max(radius,.001))*shape.w,radial-reach*.45);
  vec2 size=vec2(cellWidth*(.55+.35*rnd),reach*.58);
  float edge=(length(q/size)-1.)*min(size.x,size.y);
  if(rnd>.12){
   result=max(result,ink(edge,weight,aa));
   if(rnd2>coreRules.w)result=max(result,ink(edge+min(size.x,size.y)*.24,weight*.5,aa));
  }
 }
 // Irregular ink punctuation, with density tied to this drawing's grammar.
 float spot=length(vec2(tangent,radial+cellHeight*.9));
 if(rnd<coreRules.z*.45)
  result=max(result,1.-smoothstep(cellHeight*.36-aa,cellHeight*.36+aa,spot));
 return result;
}
void main(){
 // Fill the entire viewport: no centered fit or letterboxed composition.
 vec2 uv=gl_FragCoord.xy/resolution;
 // Texture lives in artwork coordinates, so it stays still during redraw/export.
 vec2 paper=uv*vec2(resolution.x/resolution.y,1.)*1100.;
 vec2 fiber=vec2(paperNoise(paper*.7),paperNoise(paper*.7+31.7))-.5;
 uv+=fiber*FUZZ*.95/(1100.*vec2(resolution.x/resolution.y,1.));
 vec2 scale=vec2(4.,3.);
 float aa=.55*max(scale.x/resolution.x,scale.y/resolution.y);
 float black=0.,white=0.;
 float darkRelief=0.,lightRelief=0.,contactShadow=0.,crossingShadow=0.;
 // Shared, frame-spanning warp ties local motifs into one interlaced field.
 vec2 world=(uv-.5)*scale;
 vec2 flow=world;
 flow.x+=.22*sin(world.y*2.2+geometricCore.y*TAU);
 flow.y+=.24*sin(world.x*1.8+geometricCore.z*TAU);
 vec2 weavePoint=rot(weave.x)*flow;
 for(int strand=-1;strand<=1;strand++){
  float f=float(strand),phase=geometricCore.w*TAU+f*1.7;
  float blackPath=weavePoint.y-f*weave.y-weave.z*sin(weavePoint.x*2.1+phase);
  float whitePath=weavePoint.x-f*weave.y*1.3-weave.z*1.15*sin(weavePoint.y*2.3-phase);
  float blackWidth=weave.w*(.042+.023*(.5+.5*sin(weavePoint.x*2.8+phase)));
  float whiteWidth=weave.w*(.047+.025*(.5+.5*cos(weavePoint.y*3.1-phase)));
  black=max(black,ink(blackPath,blackWidth,aa));
  white=max(white,ink(whitePath,whiteWidth,aa));
  if(metallicShading>.5){
   // Use the signed distance across each ribbon to place its highlight and shadow.
   float darkProfile=blackPath/blackWidth;
   float lightProfile=whitePath/whiteWidth;
   float darkEdge=(darkProfile+.34)*2.6;
   float darkHighlight=exp(-darkEdge*darkEdge);
   float lightEdge=(lightProfile+.30)*2.4;
   float lightHighlight=exp(-lightEdge*lightEdge);
   float reflectance=.5+.5*sin(flow.x*3.3+flow.y*2.6+phase);
   // Narrow reflections sit over the broader shading of each curved face.
   float reflectedLine=(darkProfile+.34-.10*(reflectance-.5))*6.;
   float darkGlint=exp(-reflectedLine*reflectedLine)*(.13+.15*reflectance);
   float silverLine=(lightProfile+.30)*6.5;
   float lightGlint=exp(-silverLine*silverLine)*(.065+.05*reflectance);
   float darkFace=sqrt(max(0.,1.-darkProfile*darkProfile));
   float lightFace=sqrt(max(0.,1.-lightProfile*lightProfile));
   float rimDistance=(darkProfile+.84)*9.;
   float brightRim=exp(-rimDistance*rimDistance);
   // Shade the underside opposite the bright bevel to give each ribbon thickness.
   float darkUnderside=smoothstep(.15,.95,darkProfile);
   float lightUnderside=smoothstep(.05,.93,lightProfile);
   darkRelief=max(darkRelief,ink(blackPath,blackWidth,aa)*
    (.17*darkFace*(1.-.75*darkUnderside)+darkHighlight*(.20+.17*reflectance)+.23*brightRim+darkGlint));
   lightRelief=max(lightRelief,ink(whitePath,whiteWidth,aa)*
    (.11+.32*lightUnderside-.085*lightHighlight-.035*lightFace-lightGlint));
   float shadowEdge=(darkProfile-1.08)*1.05;
   float lightShadowEdge=(lightProfile-1.24)*1.45;
   float darkCast=.22*exp(-shadowEdge*shadowEdge);
   float lightCast=.14*exp(-lightShadowEdge*lightShadowEdge);
   contactShadow=max(contactShadow,max(darkCast,lightCast));
   // The light ribbon shades the dark one just past the crossing.
   float whiteShadow=(lightProfile-1.12)*2.3;
   crossingShadow=max(crossingShadow,.16*exp(-whiteShadow*whiteShadow));
  }
  // Fine companions follow the same spine, carrying the pattern through crossings.
  for(int k=1;k<=2;k++){
   float offset=float(k)*.047+.06;
   black=max(black,ink(blackPath-offset,.0018,aa));
   white=max(white,ink(whitePath+offset,.0018,aa));
  }
 }
 for(int i=0;i<12;i++){
  vec4 body=bodies[i],shape=proportions[i],turn=orientations[i],style=styles[i];
  vec2 q=rot(turn.x)*(flow-(body.xy-.5)*scale)/shape.xy;
  float coverage=drawing(q,body.w,shape,turn,style,aa/min(shape.x,shape.y));
  if(body.z<.5)black=max(black,coverage);
  else white=max(white,coverage);
 }
 // Independent coverage fields: neither=white, black only=black,
 // white only=white, black AND white=50% gray. Painting order is irrelevant.
 float neither=(1.-black)*(1.-white);
 float whiteOnly=white*(1.-black);
 float overlap=black*white;
 float value=neither+whiteOnly+.5*overlap;
 if(metallicShading>.5){
  // Keep the field light, with silver midtones concentrated around the ribbons.
  float ambient=.955+.035*sin(1.4*world.x+1.8*world.y);
  float grain=(paperNoise(paper*.48)-.5)*.026;
  float shadedBackground=(ambient-lightRelief-contactShadow)*(1.-black);
  float shadedInk=max(.055,.11+darkRelief-crossingShadow)*black*(1.-white);
  float shadedOverlap=(.54+darkRelief*.38-lightRelief*.45-crossingShadow*.25)*overlap;
  value=clamp(shadedBackground+shadedInk+shadedOverlap+grain,0.,1.);
 }
 gl_FragColor=vec4(vec3(value),1.);
}
