import * as PIXI from 'pixi.js';
import { Bitmap } from '.';
import { TilemapRenderer } from '.';

export const MAX_GL_TEXTURES = 3;
export const VERTEX_STRIDE = 9 * 4;

export class TilemapLayer extends PIXI.Container {
  static readonly MAX_GL_TEXTURES = MAX_GL_TEXTURES
  static readonly VERTEX_STRIDE = VERTEX_STRIDE

  z = 0

  _elements: Array<number[]> = [];
  _indexBuffer: PIXI.Buffer | null = null;
  _indexArray: Uint16Array | Uint32Array | Float32Array = new Float32Array(0);
  _vertexBuffer: PIXI.Buffer | null = null;
  _vertexArray: Uint16Array | Uint32Array | Float32Array = new Float32Array(0);
  _vao: PIXI.Geometry | null = null;
  _needsTexturesUpdate = false;
  _needsVertexUpdate = false;
  _images: TexImageSource[] = [];
  _state = (PIXI.State as any).for2d();

  constructor()
  constructor(thisClass: Constructable<TilemapLayer>)
  constructor(arg?: any) {
    super();
    if (typeof arg === "function" && arg === TilemapLayer) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    // dup with constructor super()
    PIXI.Container.call(this);
    this._elements = [];
    this._indexBuffer = null;
    this._indexArray = new Float32Array(0);
    this._vertexBuffer = null;
    this._vertexArray = new Float32Array(0);
    this._vao = null;
    this._needsTexturesUpdate = false;
    this._needsVertexUpdate = false;
    this._images = [];
    this._state = (PIXI.State as any).for2d();
    this._createVao();
  };


  destroy(): void {
    if (this._vao) {
        this._vao.destroy();
        this._indexBuffer!.destroy();
        this._vertexBuffer!.destroy();
    }
    this._indexBuffer = null;
    this._vertexBuffer = null;
    this._vao = null;
  };

  setBitmaps(bitmaps: Bitmap[]): void {
    this._images = bitmaps.map(bitmap => bitmap.image || bitmap.canvas);
    this._needsTexturesUpdate = true;
  };

  clear(): void {
    this._elements.length = 0;
    this._needsVertexUpdate = true;
  };

  addRect(setNumber: number, sx: number, sy: number, dx: number, dy: number, w: number, h: number): void {
    this._elements.push([setNumber, sx, sy, dx, dy, w, h]);
  };

  render(renderer: PIXI.Renderer): void {
    const gl = renderer.gl;
    const tilemapRenderer = (renderer.plugins as any).rpgtilemap as TilemapRenderer;
    const shader = tilemapRenderer.getShader();
    const matrix = shader.uniforms.uProjectionMatrix;

    renderer.batch.setObjectRenderer(tilemapRenderer);
    renderer.projection.projectionMatrix.copyTo(matrix);
    matrix.append(this.worldTransform);
    renderer.shader.bind(shader, false);

    if (this._needsTexturesUpdate) {
        tilemapRenderer.updateTextures(renderer, this._images);
        this._needsTexturesUpdate = false;
    }
    tilemapRenderer.bindTextures(renderer);
    renderer.geometry.bind(this._vao!, shader);
    this._updateIndexBuffer();
    if (this._needsVertexUpdate) {
        this._updateVertexBuffer();
        this._needsVertexUpdate = false;
    }
    (renderer.geometry as any).updateBuffers();

    const numElements = this._elements.length;
    if (numElements > 0) {
        renderer.state.set(this._state);
        renderer.geometry.draw(gl.TRIANGLES, numElements * 6, 0);
    }
  };

  isReady(): boolean {
    if (this._images.length === 0) {
        return false;
    }
    for (const texture of this._images) {
        if (!texture || !(texture as any).valid) {
            return false;
        }
    }
    return true;
  };

  _createVao(): void {
    const ib = new (PIXI.Buffer as any)(null, true, true);
    const vb = new (PIXI.Buffer as any)(null, true, false);
    const stride = TilemapLayer.VERTEX_STRIDE;
    const type = PIXI.TYPES.FLOAT;
    const geometry = new PIXI.Geometry();
    this._indexBuffer = ib;
    this._vertexBuffer = vb;
    this._vao = geometry
        .addIndex(this._indexBuffer!)
        .addAttribute("aTextureId", vb, 1, false, type, stride, 0)
        .addAttribute("aFrame", vb, 4, false, type, stride, 1 * 4)
        .addAttribute("aSource", vb, 2, false, type, stride, 5 * 4)
        .addAttribute("aDest", vb, 2, false, type, stride, 7 * 4);
  };

  _updateIndexBuffer(): void {
    const numElements = this._elements.length;
    if (this._indexArray.length < numElements * 6 * 2) {
        this._indexArray = PIXI.utils.createIndicesForQuads(numElements * 2);
        this._indexBuffer!.update(this._indexArray);
    }
  };

  _updateVertexBuffer(): void {
    const numElements = this._elements.length;
    const required = numElements * TilemapLayer.VERTEX_STRIDE;
    if (this._vertexArray.length < required) {
        this._vertexArray = new Float32Array(required * 2);
    }
    const vertexArray = this._vertexArray;
    let index = 0;
    for (const item of this._elements) {
        const setNumber = item[0];
        const tid = setNumber >> 2;
        const sxOffset = 1024 * (setNumber & 1);
        const syOffset = 1024 * ((setNumber >> 1) & 1);
        const sx = item[1] + sxOffset;
        const sy = item[2] + syOffset;
        const dx = item[3];
        const dy = item[4];
        const w = item[5];
        const h = item[6];
        const frameLeft = sx + 0.5;
        const frameTop = sy + 0.5;
        const frameRight = sx + w - 0.5;
        const frameBottom = sy + h - 0.5;
        vertexArray[index++] = tid;
        vertexArray[index++] = frameLeft;
        vertexArray[index++] = frameTop;
        vertexArray[index++] = frameRight;
        vertexArray[index++] = frameBottom;
        vertexArray[index++] = sx;
        vertexArray[index++] = sy;
        vertexArray[index++] = dx;
        vertexArray[index++] = dy;
        vertexArray[index++] = tid;
        vertexArray[index++] = frameLeft;
        vertexArray[index++] = frameTop;
        vertexArray[index++] = frameRight;
        vertexArray[index++] = frameBottom;
        vertexArray[index++] = sx + w;
        vertexArray[index++] = sy;
        vertexArray[index++] = dx + w;
        vertexArray[index++] = dy;
        vertexArray[index++] = tid;
        vertexArray[index++] = frameLeft;
        vertexArray[index++] = frameTop;
        vertexArray[index++] = frameRight;
        vertexArray[index++] = frameBottom;
        vertexArray[index++] = sx + w;
        vertexArray[index++] = sy + h;
        vertexArray[index++] = dx + w;
        vertexArray[index++] = dy + h;
        vertexArray[index++] = tid;
        vertexArray[index++] = frameLeft;
        vertexArray[index++] = frameTop;
        vertexArray[index++] = frameRight;
        vertexArray[index++] = frameBottom;
        vertexArray[index++] = sx;
        vertexArray[index++] = sy + h;
        vertexArray[index++] = dx;
        vertexArray[index++] = dy + h;
    }
    this._vertexBuffer!.update(vertexArray);
  };
}

