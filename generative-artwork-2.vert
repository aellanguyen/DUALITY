// VERTEX SHADER (GLSL): position the screen-filling quad.
// This is the drawing surface, not a triangle mesh of the sculpture.
precision highp float;
attribute vec3 aPosition;
void main(){
 gl_Position=vec4(aPosition.xy,0.,1.);
}
