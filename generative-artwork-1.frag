// FRAGMENT SHADER (GLSL): geometry, symmetry, holes, texture, camera and lighting.
// p5 loads this file in sketch.js -> preload(), then passes settings with setUniform().
precision highp float;
// A uniform is a setting sent from JavaScript to the GPU using setUniform().
// float = one number; vec2/vec3/vec4 = 2/3/4 numbers; .x/.y/.z/.w select components.
// resolution is the internal drawing-buffer size in pixels, not necessarily the CSS size.
uniform vec2 resolution;
uniform float transparentBackground;
// yaw/pitch: camera angles; duality: optional black/white material split (currently always 0).
// blendWidth: softness where added volumes meet.
// textureAmount: tiny surface-displacement height; textureFrequency: its repetition rate.
// layerSpacing: spacing between three skins; ornamentScale: fine-detail density.
// geometricMix: round-to-diamond HOLE profile, not the overall hard/soft body blend.
// symmetryOrder: 1 = bilateral mirror; 2..5 = rotational repeats with mirrored half-sectors.
uniform float yaw,pitch,duality,blendWidth,textureAmount,textureFrequency,layerSpacing,ornamentScale,geometricMix,symmetryOrder;
// Packed arrays: each consecutive group of four JavaScript numbers becomes one vec4.
// bodies[i]       = [centerX, centerY, centerZ, radius]; radius 0 disables the slot.
// proportions[i]  = [stretchX, stretchY, stretchZ, primitiveKind].
//   kind 0 = loop, 1 = solid rounded volume, 2 = hollow shell, 3 = rounded box.
// orientations[i] = [rotationXY, rotationXZ, rotationYZ, wall/tube width ratio].
// styles[i]       = [hardness, reserved, BooleanOperation, reserved].
//   operation 0 = add; 1 = subtract; 2 = intersect (supported, not generated currently).
//   styles.y and styles.w are reserved and do not currently affect the picture.
// openings[i]     = [centerX, centerY, radius, verticalAspect]; radius 0 disables it.
// 12 body slots and 9 hole slots are GPU storage limits, NOT 12/9 finished presets.
uniform vec4 bodies[12],proportions[12],orientations[12],styles[12],openings[9];
// geometricCore = [centerX, centerY, centerZ, size] for the main folded fractal.
// coreRules = [negative expansion scale, inversion radius-squared threshold,
//              fold rotation, offset bias]. The generated offset bias is currently 0.
uniform vec4 geometricCore,coreRules;
// coreStretch stretches the main core separately along X, Y and Z.
uniform vec3 coreStretch;
// Small shared math helpers. rot() turns a 2D coordinate pair.
// GLSL mix(a,b,t) blends a->b; clamp(x,low,high) restricts a number to a range.
mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
// Smooth union: combine two distance fields, softening their seam by width k.
// This is used only when adding material. It is not a transparency/opacity blend.
float merge(float a,float b,float k){
 float h=clamp(.5+.5*(b-a)/k,0.,1.);
 return mix(b,a,h)-k*h*(1.-h);
}
// The geometric visual you liked: a Mandelbox-style repeated-fold distance estimator.
// Given a point p in 3D space, estimate its distance from the folded surface.
// Most solid-field operations use: positive = outside, zero = surface, negative = inside.
// These complicated/deformed fields are estimates, not exact distances everywhere.
float oldFoldedCore(vec3 p){
// Move into the core's local coordinates, undoing its position and stretch.
 vec3 q=(p-geometricCore.xyz)/coreStretch;
// c stays fixed as feedback; z is repeatedly transformed.
// dr tracks accumulated magnification so the final distance can be scaled back.
 vec3 c=q/geometricCore.w*2.25,z=c;float dr=1.;
// Calculate these fixed rotations once per distance evaluation, outside the repetition loop.
 mat2 foldXZ=rot(coreRules.z),foldYZ=rot(coreRules.z*.57);
 float inversionLimit=1./coreRules.y,scaleMagnitude=abs(coreRules.x);
// 10 recursive passes create large folds plus smaller folds nested within them.
// If changing this depth, also review the -9 exponent below: it represents 1 - 10.
 for(int i=0;i<10;i++){
  z.xz=foldXZ*z.xz;z.yz=foldYZ*z.yz;
// Box fold: reflect coordinates back across the boundaries -1 and +1.
  z=2.*clamp(z,-1.,1.)-z;
// Sphere inversion: expand small-radius parts, creating cavities and nested relief.
  float k=clamp(1./max(dot(z,z),.000001),1.,inversionLimit);
// Apply inversion, expansion and feedback from the original point.
  z*=k;dr*=k;z=z*coreRules.x+c+vec3(coreRules.w,0.,-coreRules.w);
  dr=dr*scaleMagnitude+1.;
 }
// Convert the transformed point back to a surface-distance estimate in scene units.
 return ((length(z)-abs(coreRules.x-1.))/dr-pow(abs(coreRules.x),-9.))/2.25*geometricCore.w*min(coreStretch.x,min(coreStretch.y,coreStretch.z));
}
// Despite its historical name, this returns an L8 "box-like length", not squared distance.
// A normal length() gives circular sections; this gives squarer, softly cornered sections.
// Repeated multiplication/square roots avoid several general-purpose pow() calls.
float squaredLength(vec3 p){
 vec3 v=p*p;v*=v;v*=v;return sqrt(sqrt(sqrt(v.x+v.y+v.z)));
}
// Build ONE unmirrored region of the sculpture at point p.
// scene() below mirrors/repeats this entire construction, including every hole and texture.
float sculpture(vec3 p){
// Start with empty space (a large distance), then add/remove material.
 float d=8.;
 if(geometricCore.w>.001){
  d=oldFoldedCore(p);
// A repeating grid of small through-holes in the folded core.
// .24 controls grid spacing; .025 controls each small hole's radius.
// These are real geometric holes, not painted dark dots.
  vec2 cell=mod(p.xy+vec2(.12),.24)-.12;
  d=max(d,(.025-length(cell))*.85);
 }
// Visit every body slot; radius-zero slots are ignored.
 for(int i=0;i<12;i++){
  vec4 body=bodies[i],shape=proportions[i],turn=orientations[i];
  if(body.w>.001){
// Translate, rotate and undo stretching to evaluate this body in its own coordinates.
   vec3 q=p-body.xyz;
   q.xy=rot(turn.x)*q.xy;q.xz=rot(turn.y)*q.xz;q.yz=rot(turn.z)*q.yz;
   q/=shape.xyz;
   float radius=body.w;
// Per-body hardness: 0 is organic/round; 1 is more geometric/box-like.
   float hard=styles[i].x;
   // Broad folded surfaces remain visible beneath the finer ornament.
   q.x+=sin(q.y/radius*4.+sin(q.z/radius*3.))*radius*.045*(1.-hard);
   q.z+=sin(q.x/radius*5.+q.y/radius*3.)*radius*.035*(1.-hard);
   float v;
// Select the primitive kind. Each formula describes a volume using distance-like math.
   if(shape.w<.5){
    // A thick folded loop, with a real open center.
    float ring=mix(length(q.xy),squaredLength(vec3(q.xy,0.)),hard);
    vec3 crossSection=vec3(ring-body.w*.72,q.z,0.);
    v=mix(length(crossSection),squaredLength(crossSection),hard)-body.w*turn.w;
   }else if(shape.w<1.5){
    v=mix(length(q),squaredLength(q),hard)-body.w;
   }else if(shape.w<2.5){
    // Hollow volumetric layers, rather than triangular tessellation.
    v=abs(mix(length(q),squaredLength(q),hard)-body.w)-body.w*turn.w;
   }else{
    vec3 box=abs(q)-vec3(body.w*(.65+.23*hard));
    v=length(max(box,0.))+min(max(box.x,max(box.y,box.z)),0.)-body.w*(.35-.23*hard);
   }
// Keep the undecorated solid boundary so cutter volumes can skip all ornamental work.
   float base=v;
   // Cutters only need their solid boundary; their discarded ornament was expensive.
   if(styles[i].z>.5){
    float cutDistance=base*min(shape.x,min(shape.y,shape.z));
    d=styles[i].z>1.5?max(d,cutDistance):max(d,-cutDistance);
    continue;
   }
   // Three distinct volumetric skins: openings reveal the layers behind the front surface.
// .022 is the skin-thickness ratio. The min() below keeps three thin bands:
// at base = 0, -spacing, and -2*spacing. Openings let you see their separate edges.
   float thickness=radius*.022;
   float spacing=radius*layerSpacing;
   v=min(abs(base),min(abs(base+spacing),abs(base+spacing*2.)))-thickness;
   if(abs(base)<radius*.19){
    // Two nested scales of folded lace form real ridges, pores, and undercuts.
    // Unlike the previous tiles, the detail has no square or triangular grid.
    for(int level=0;level<2;level++){
// Level 0 gives larger ornament, level 1 gives finer ornament.
// Larger frequencies mean smaller/more numerous details; this does not add body volumes.
     float f=(level==0?12.:28.)*ornamentScale/radius;
     vec3 g=q*f;
     g.xy=rot(.43+float(level)*.61)*g.xy;
// Flowing periodic lattice: a gyroid-like pattern used as actual surface geometry.
     float weave=sin(g.x)*cos(g.y)+sin(g.y)*cos(g.z)+sin(g.z)*cos(g.x);
     float organic=(abs(weave)-.42)/(f*2.3);
     // Straight folded ribs cross the flowing pores, with a per-volume blend.
// Repeated folded coordinates form straighter plate/rib details.
     vec3 folded=abs(mod(g+1.,2.)-1.);
     float plates=(min(folded.x,min(folded.y,folded.z))-.14)/f;
     float lace=mix(organic,plates,hard*.78);
// Keep ornament close to the body surface instead of filling all of 3D space with it.
     float band=max(base-radius*(level==0?.12:.065),-base-radius*.025);
     v=min(v,max(lace,band));
    }
   }
// Rescale conservatively after anisotropic stretching, then merge this added body.
   v*=min(shape.x,min(shape.y,shape.z));
   d=merge(d,v,blendWidth);
  }
 }
 // Surface relief has its own scale, separate from the silhouette and openings.
 float f=textureFrequency;
 float relief=sin(p.x*f+sin(p.z*f*.4))*sin(p.y*f*.93)*sin(p.z*f*1.07);
 relief+=.22*sin(p.x*f*2.1)*sin(p.y*f*2.3)*sin(p.z*f*2.2);
// Smaller-scale displacement roughens the geometry; lighting makes that relief visible.
 d+=relief*textureAmount;
// Cut the larger, individually placed windows. They continue along the Z direction.
// hole.w changes their height/width ratio; geometricMix makes their outline more diamond-like.
// max(existingDistance, -cutterDistance) removes the cutter from the existing material.
 for(int i=0;i<9;i++){
  vec4 hole=openings[i];
  if(hole.z>.001){
   vec2 v=p.xy-hole.xy;
   v.y/=hole.w;
   float profile=mix(length(v),(abs(v.x)+abs(v.y))*.78,geometricMix*.85);
   d=max(d,(hole.z-profile)*min(1.,hole.w));
  }
 }
// Conservative marching factor for these warped/combined distance estimates.
// Increasing this may make rendering faster but can skip surfaces or thin layers.
 return d*.48;
}
// Reflect the whole construction, including cuts and texture: symmetry is structural.
// STRUCTURAL SYMMETRY: query a reflected coordinate instead of drawing separate copies.
// Because the whole construction is reflected, cutters and fine ornament also match.
float scene(vec3 p){
 vec3 q=p;
// Bilateral case: the left half queries the same geometry as the right half.
 if(symmetryOrder<1.5){q.x=abs(q.x);}
 else{
// 2*pi is one full turn. Fold angles into one rotational sector, then mirror its half.
// N=2..5 gives N rotational repetitions, divided into 2*N reflected half-sectors.
  float sector=6.28318530718/symmetryOrder;
  float a=mod(atan(q.y,q.x)+sector*.5,sector)-sector*.5;
  q.xy=length(q.xy)*vec2(cos(a),abs(sin(a)));
 }
 return sculpture(q);
}
// Estimate the surface normal: which direction the surface faces.
// Four nearby distance queries approximate its slope, used for lighting.
vec3 normal(vec3 p,float e){
 vec2 k=vec2(1.,-1.);
 return normalize(k.xyy*scene(p+k.xyy*e)+k.yyx*scene(p+k.yyx*e)+k.yxy*scene(p+k.yxy*e)+k.xxx*scene(p+k.xxx*e));
}
// Ambient occlusion: sample five points above the surface.
// Nearby surrounding material darkens creases/cavities, making layers readable.
float ao(vec3 p,vec3 n){
 float occ=0.,weight=1.;
 for(int i=1;i<=5;i++){float h=.018*float(i*i);occ+=(h-scene(p+n*h))*weight;weight*=.65;}
 return clamp(1.-occ*.95,.28,1.);
}
// Soft direct-light shadow: walk toward the light and look for blocking material.
// At most 34 samples; stop early when far enough away or already deeply shadowed.
float shadow(vec3 p,vec3 l){
 float t=.012,res=1.;
 for(int i=0;i<34;i++){
  float h=scene(p+l*t);res=min(res,10.*h/t);t+=clamp(h,.012,.19);if(t>4.||res<.02)break;
 }
 return clamp(res,.08,1.);
}
// Main fragment-shader entry point. Runs once PER PIXEL.
// Ray marching sends a viewing ray into the mathematical scene, then shades its first hit.
void main(){
// Convert this pixel position to centered screen coordinates; preserve aspect ratio.
 vec2 uv=(gl_FragCoord.xy*2.-resolution)/resolution.y;
// Camera framing: larger 6.2 moves the camera away, making the sculpture look smaller.
// Narrow windows move it farther away to keep the shape within the screen width.
 float cameraDistance=6.2/min(1.,resolution.x/resolution.y);
// ro = ray origin (camera position). yaw/pitch rotate the camera around the object.
 vec3 ro=vec3(0.,.15,cameraDistance);ro.yz=rot(pitch)*ro.yz;ro.xz=rot(yaw)*ro.xz;
// Build forward/right/up camera directions, looking at the origin [0,0,0].
 vec3 target=vec3(0.,0.,0.),ww=normalize(target-ro),uu=normalize(cross(ww,vec3(0.,1.,0.))),vv=cross(uu,ww);
// rd = ray direction. 2.55 is the focal-length factor; larger values magnify the object.
 float focalLength=mix(2.55,3.8,transparentBackground);
 vec3 rd=normalize(uv.x*uu+uv.y*vv+focalLength*ww);
// t is distance traveled along the ray; hit remembers whether we reached a surface.
 float t=0.,d=0.;bool hit=false;
// Up to 320 marching steps per pixel. Usually exits earlier.
// This is a major rendering-cost control, but reducing it can lose difficult/thin surfaces.
 for(int i=0;i<320;i++){
  vec3 p=ro+rd*t;d=scene(p);
// Stop close to a surface; the tolerance increases slightly with viewing distance.
  if(d<max(.00012,t*.000065)){hit=true;break;}
// Advance conservatively; abandon rays that travel beyond the far-distance limit.
  t+=max(d*.72,.00008);if(t>cameraDistance+12.)break;
 }
// Missed rays get this dark background plus a soft central glow (independent of CSS).
 vec3 color=vec3(.075)+vec3(.022)*exp(-dot(uv,uv)*.6);
// Hit rays: calculate a normal, illumination, occlusion, highlights and edge lighting.
 if(hit){
  vec3 p=ro+rd*t;vec3 n=normal(p,max(.004,t*.00060));
// Orient the shading normal toward the viewer for these thin/double-sided surfaces.
  if(dot(n,rd)>0.)n=-n;
// Main light direction [-3,5,4]; halfway is used to calculate specular highlights.
  vec3 light=normalize(vec3(-3.,5.,4.)),halfway=normalize(light-rd);
  float ambient=ao(p,n),sh=shadow(p+n*.003,light),diff=max(dot(n,light),0.);
// 48 controls highlight sharpness: lower = broader highlights, higher = tighter ones.
  float spec=pow(max(dot(n,halfway),0.),48.);
  float rim=pow(1.-max(dot(n,-rd),0.),3.);
  float bounce=max(dot(n,normalize(vec3(2.,-.6,1.))),0.);
  float fill=max(dot(n,normalize(vec3(3.,2.,2.))),0.);
// Brightness recipe: .32 ambient base, .66 main light, .16 fill, .06 bounce,
// plus .26 highlight and .10 rim. These change shading, not geometry.
  float value=(.32+.66*diff*sh+.16*fill+.06*bounce)*ambient+spec*.26*sh+rim*.10*ambient;
  // White porcelain highlights, with occlusion reserved for the deep cavities.
// Optional material split. duality=0 (the generator's current setting) keeps a white material.
// Raising duality toward 1 adds a dark region; shadows alone already create black/white contrast.
  float darkRegion=smoothstep(-.22,.22,p.x+.16*sin(p.y*5.));
  float albedo=mix(1.,mix(1.,.09,darkRegion),duality);
  color=vec3(clamp(value*albedo,0.,1.));
 }
// Final tonal adjustment. Clamp/lighting may still make white material look gray in shadow.
 color=pow(color,vec3(.89));
// The final RGBA pixel: RGB color plus alpha 1 (fully opaque).
 float alpha=hit ? 1. : 1.-transparentBackground;
 gl_FragColor=vec4(color*alpha,alpha);
}
