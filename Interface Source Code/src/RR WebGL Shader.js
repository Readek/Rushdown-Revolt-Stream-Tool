"use strict";

// this script is based on the RoA Recolorer WebGL2 shader
// for comments and details on what this script is doing, go here https://github.com/Readek/RoA-Skin-Recolorer

const vertexShaderSource = `#version 300 es

in vec2 a_position;
in vec2 a_texCoord;

uniform vec2 u_resolution;

out vec2 v_texCoord;

void main() {

  vec2 zeroToOne = a_position / u_resolution;

  vec2 zeroToTwo = zeroToOne * 2.0;

  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

  v_texCoord = a_texCoord;
  
}
`;

const fragmentShaderSource = `#version 300 es

precision highp float;
#define LOWPREC lowp


uniform sampler2D u_image;


in vec2 v_texCoord;

const int maxcolors = 9;

uniform vec4 colorIn[maxcolors];
uniform vec4 colorOut[maxcolors];
uniform vec4 colorTolerance[maxcolors];


vec3 rgb_to_hsv(vec3 col)
{
    float H = 0.0;
    float S = 0.0;
    float V = 0.0;
    
    float M = max(col.r, max(col.g, col.b));
    float m = min(col.r, min(col.g, col.b));
    
    V = M;
    
    float C = M - m;
    
    if (C > 0.0)
    {
        if (M == col.r) H = mod( (col.g - col.b) / C, 6.0);
        if (M == col.g) H = (col.b - col.r) / C + 2.0;
        if (M == col.b) H = (col.r - col.g) / C + 4.0;
        H /= 6.0;
        S = C / V;
    }
    
    return vec3(H, S, V);
}

vec3 hsv_to_rgb(vec3 col)
{
    float H = col.r;
    float S = col.g;
    float V = col.b;
    
    float C = V * S;
    
    H *= 6.0;
    float X = C * (1.0 - abs( mod(H, 2.0) - 1.0 ));
    float m = V - C;
    C += m;
    X += m;
    
    if (H < 1.0) return vec3(C, X, m);
    if (H < 2.0) return vec3(X, C, m);
    if (H < 3.0) return vec3(m, C, X);
    if (H < 4.0) return vec3(m, X, C);
    if (H < 5.0) return vec3(X, m, C);
    else         return vec3(C, m, X);
}

out vec4 outColor;

void main() {

  vec4 colorPixel = texture( u_image, v_texCoord );
  
  vec4 colorResult = colorPixel;
  
  vec4 colorHSV = vec4( rgb_to_hsv( colorPixel.rgb ), colorPixel.a);


  for (int i=0; i< maxcolors; i+=1) {

    vec4 colorInHSV = vec4( rgb_to_hsv( colorIn[i].rgb ), colorIn[i].a);
    
    vec4 colorDelta = colorHSV - colorInHSV;
    
    if (abs(colorDelta.r)>0.5) colorDelta.r -= sign(colorDelta.r);

    if ( all( lessThanEqual( abs(colorDelta), colorTolerance[i] ) ) ) {

      vec4 tColorOut = colorOut[i];
      vec4 colorOutHSV = vec4( rgb_to_hsv( tColorOut.rgb ), tColorOut.a);
    
      colorResult = vec4 (
        hsv_to_rgb(
          vec3(
            mod(colorOutHSV.r + colorDelta.r, 1.0),
            clamp(colorOutHSV.g + colorDelta.g, 0.0, 1.0),
            clamp(colorOutHSV.b + colorDelta.b, 0.0, 1.0)
          )
        ), clamp(tColorOut.a + colorDelta.a, 0.0, 1.0)
      );
      
      colorResult.a = min(colorResult.a, colorPixel.a);

    }
  }

  outColor = colorResult;

}
`;

class RRecolor {

  constructor(ogColor, colorTolerance) {
    this.colorIn = ogColor;
    this.colorTolerance = colorTolerance;
  }

  async addImage(canvas, imgPath) {
    const skinImg = new Image();
    skinImg.src = imgPath;
    await skinImg.decode();

    canvas.width = skinImg.width;
    canvas.height = skinImg.height;
    

    // it's WebGL time, get ready to not understand anything (don't worry i dont either)
    const gl = canvas.getContext("webgl2", { premultipliedAlpha: false });

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);

    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    const texCoordAttributeLocation = gl.getAttribLocation(program, "a_texCoord");

    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const imageLocation = gl.getUniformLocation(program, "u_image");
    const colorInLoc = gl.getUniformLocation(program, "colorIn");
    const colorOutLoc = gl.getUniformLocation(program, "colorOut");
    const colorToleranceLoc = gl.getUniformLocation(program, "colorTolerance");

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const positionBuffer = gl.createBuffer();

    gl.enableVertexAttribArray(positionAttributeLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const size = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0,  0.0,
        1.0,  0.0,
        0.0,  1.0,
        0.0,  1.0,
        1.0,  0.0,
        1.0,  1.0,
    ]), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(texCoordAttributeLocation);

    gl.vertexAttribPointer(texCoordAttributeLocation, size, type, normalize, stride, offset);

    const texture = gl.createTexture();

    gl.activeTexture(gl.TEXTURE0 + 0);

    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    const mipLevel = 0;
    const internalFormat = gl.RGBA;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    gl.texImage2D(gl.TEXTURE_2D, mipLevel, internalFormat, srcFormat, srcType, skinImg);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);

    gl.bindVertexArray(vao);

    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

    gl.uniform1i(imageLocation, 0);

    gl.uniform4fv(colorInLoc, div255(this.colorIn));
    gl.uniform4fv(colorToleranceLoc, divHSV(this.colorTolerance));

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    setRectangle(gl, 0, 0, skinImg.width, skinImg.height);

    this.charImg = {
      canvas : canvas,
      gl : gl,
      colorInLoc : colorInLoc,
      colorToleranceLoc : colorToleranceLoc,
      colorOutLoc : colorOutLoc,
      offset : offset,
    }
  }

  recolor(colorOut) {
    render(this.charImg, colorOut ? colorOut : this.colorIn);
  }

  download(colorOut) {
    return render(this.charImg, colorOut ? colorOut : this.colorIn, true);
  }
  
}

function render(glCan, colorOut, dl = false) {

  const canvas = glCan.canvas;
  const gl = glCan.gl;
  const colorOutLoc = glCan.colorOutLoc;
  const offset = glCan.offset;  

  gl.uniform4fv(colorOutLoc, div255(colorOut));

  const primitiveType = gl.TRIANGLES;
  const count = 6;
  gl.drawArrays(primitiveType, offset, count);

  if (dl) {
    const data = canvas.toDataURL().replace(/^data:image\/\w+;base64,/, "");
    return Buffer.from(data, 'base64');
  }

}

function div255(array) {
  const newArray = [];
  for (let i = 1; i < array.length + 1; i++) {
    if (i % 4 != 0) {
      newArray[i-1] = array[i-1]/255;
    } else {
      newArray[i-1] = array[i-1];
    }
  }
  return newArray;
}
function divHSV(array) {
  const newArray = [];
  let count = 0;
  for (let i = 0; i < array.length; i++) {
    count++;
    if (count == 1) {
      newArray[i] = array[i]/360;
    } else if (count == 2 || count == 3) {
      newArray[i] = array[i]/100;
    } else {
      newArray[i] = array[i];
      count = 0;
    }
  }
  return newArray;
}

function setRectangle(gl, x, y, width, height) {
  const x1 = x;
  const x2 = x + width;
  const y1 = y;
  const y2 = y + height;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,
     x2, y1,
     x1, y2,
     x1, y2,
     x2, y1,
     x2, y2,
  ]), gl.STATIC_DRAW);
}

function compileShader(gl, shaderType, shaderSource) {
  const shader = gl.createShader(shaderType);
  
  gl.shaderSource(shader, shaderSource);
  
  gl.compileShader(shader);
  
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success) {
    throw "could not compile shader:" + gl.getShaderInfoLog(shader);
  }
  
  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  
  gl.linkProgram(program);
  
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
      throw ("program filed to link:" + gl.getProgramInfoLog (program));
  }
  
  return program;
};