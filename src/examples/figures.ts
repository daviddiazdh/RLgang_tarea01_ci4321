// RGB triangle, FixedFunction (FF) version.
// FF hides the shaders. Compare with triangle.vanilla.ts, which shows them.
import { ATTRIB, createFixedFunction, LIGHTING } from '../vendor/ff/ff';
import { Figure, FixedColor} from './types'

// Background color #1b1e2b as linear floats in [0, 1].
const CLEAR_COLOR: readonly [number, number, number, number] = [0x1b / 255, 0x1e / 255, 0x2b / 255, 1];

// Canvas size in device pixels. Fixed so both versions render the same pixels.
const CANVAS_SIZE = 480;

// Interleaved vertex data: x, y, z a per vertex. Clip space, counter-clockwise.
const TRIANGLE = new Float32Array([
  //  x      y     z   
   0.0,   0.7,  0.0,  // top
  -0.7,  -0.6,  0.0,  // bottom left
   0.7,  -0.6,  0.0,  // bottom right
]);

const SQUARE = new Float32Array([
  //  x      y     z  
  -0.7,   0.7,  0.0,  // top left
   0.7,   0.7,  0.0,  // top right
  -0.7,  -0.7,  0.0,  // bottom left
   0.7,  -0.7,  0.0,  // bottom right
]);

const SQUARE_INDEXES = new Uint16Array([
  0, 1, 2,
  1, 2, 3
])

const R = 0.7; 
const HEXAGON_FAN = new Float32Array([
    0.0,   0.0,  0.0,
    R * Math.cos(0),               R * Math.sin(0),               0.0, // 1
    R * Math.cos(Math.PI / 3),     R * Math.sin(Math.PI / 3),     0.0, // 2
    R * Math.cos(2 * Math.PI / 3), R * Math.sin(2 * Math.PI / 3), 0.0, // 3
    R * Math.cos(Math.PI),         R * Math.sin(Math.PI),         0.0, // 4
    R * Math.cos(4 * Math.PI / 3), R * Math.sin(4 * Math.PI / 3), 0.0, // 5
    R * Math.cos(5 * Math.PI / 3), R * Math.sin(5 * Math.PI / 3), 0.0, // 6
    R * Math.cos(0),               R * Math.sin(0),               0.0  // 7
]);

const SEGMENTS = 64;

function createCircleFan(): Float32Array {
  const vertices = new Float32Array((SEGMENTS + 2) * 3);
  vertices[0] = 0.0;
  vertices[1] = 0.0;
  vertices[2] = 0.0;

  for (let i = 0; i <= SEGMENTS; i++) {
    const angle = (i / SEGMENTS) * 2 * Math.PI;
    const offset = (i + 1) * 3;

    vertices[offset + 0] = R * Math.cos(angle); 
    vertices[offset + 1] = R * Math.sin(angle); 
    vertices[offset + 2] = 0.0;                      
  }

  return vertices;
}

const CIRCLE_FAN = createCircleFan();

const STRIDE_BYTES = 3 * 4;


// Get the WebGL2 context.
function getContext(canvas: HTMLCanvasElement): WebGL2RenderingContext {
  const gl = canvas.getContext('webgl2');
  if (!gl) throw new Error('WebGL2 is not available.');
  return gl;
}

// Shaders and program: FF creates and owns them.
// Vertex specification: copy the vertex data to the GPU.
function createVertexBuffer(gl: WebGL2RenderingContext, data: Float32Array): WebGLBuffer {
  const buffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  return buffer;
}

// Index specification: copy the index data to the GPU (used just by square)
function createIndexBuffer(gl: WebGL2RenderingContext, indexes: Uint16Array): WebGLBuffer {
  const buffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexes, gl.STATIC_DRAW);
  return buffer;
}

// Describe how the vertex data is laid out, using FF's attribute slots.
function createVAO(gl: WebGL2RenderingContext, buffer: WebGLBuffer, indexBuffer?: WebGLBuffer): WebGLVertexArrayObject {
  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(ATTRIB.POSITION);
  gl.vertexAttribPointer(ATTRIB.POSITION, 3, gl.FLOAT, false, STRIDE_BYTES, 0);
  if (indexBuffer) {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  }

  gl.bindVertexArray(null);
  return vao;
}

// Pipeline state: canvas size, viewport, clear color.
function setupState(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement): void {
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(...CLEAR_COLOR);
}

// Draw the figures.
function draw(gl: WebGL2RenderingContext, ff: ReturnType<typeof createFixedFunction>, vao: WebGLVertexArrayObject, figure: string): void {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.bindVertexArray(vao);
  if(figure == 'TRIANGLE'){
    ff.drawArrays(gl.TRIANGLES, 0, 3)
  } else if (figure == 'SQUARE'){
    ff.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  } else if (figure == 'HEXAGON'){
    ff.drawArrays(gl.TRIANGLE_FAN, 0, 8);
  } else if (figure == 'CIRCLE'){
    ff.drawArrays(gl.TRIANGLE_FAN, 0, SEGMENTS + 2);
  }
}

export function run(canvas: HTMLCanvasElement, figure: Figure, color: FixedColor): void {
  const gl = getContext(canvas);
  const ff = createFixedFunction(gl, { debug: true });
  ff.disable(LIGHTING); // unlit: the output is the per-vertex color

  if(color == 'RED'){
    ff.setColor([1, 0, 0, 1]);
  } else if(color == 'GREEN'){
    ff.setColor([0, 1, 0, 1]);
  } else if(color == 'BLUE'){
    ff.setColor([0, 0, 1, 1]);
  }
  
  if(figure == 'TRIANGLE'){
    const buffer = createVertexBuffer(gl, TRIANGLE);
    var vao = createVAO(gl, buffer);
  } else if(figure == 'SQUARE'){
    const buffer = createVertexBuffer(gl, SQUARE);
    const indexBuffer = createIndexBuffer(gl, SQUARE_INDEXES);
    var vao = createVAO(gl, buffer, indexBuffer);
  } else if(figure == 'HEXAGON'){
    const buffer = createVertexBuffer(gl, HEXAGON_FAN);
    var vao = createVAO(gl, buffer);
  }  else if(figure == 'CIRCLE'){
    const buffer = createVertexBuffer(gl, CIRCLE_FAN);
    var vao = createVAO(gl, buffer);
  } else {
    const buffer = createVertexBuffer(gl, TRIANGLE);
    var vao = createVAO(gl, buffer);
  }
  setupState(gl, canvas);
  draw(gl, ff, vao, figure);
}
