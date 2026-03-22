/**
 * Babylon.js mock for testing procedural generators without WebGL.
 * This file is used as a module alias for @babylonjs/core in tests.
 */

export class Vector3 {
  constructor(public x = 0, public y = 0, public z = 0) {}
  clone() { return new Vector3(this.x, this.y, this.z); }
  scale(s: number) { return new Vector3(this.x * s, this.y * s, this.z * s); }
  set(x: number, y: number, z: number) { this.x = x; this.y = y; this.z = z; }
  setAll(v: number) { this.x = v; this.y = v; this.z = v; }
  subtract(other: Vector3) { return new Vector3(this.x - other.x, this.y - other.y, this.z - other.z); }
  static Zero() { return new Vector3(0, 0, 0); }
  static One() { return new Vector3(1, 1, 1); }
  static Minimize(a: Vector3, b: Vector3) {
    return new Vector3(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.min(a.z, b.z));
  }
  static Maximize(a: Vector3, b: Vector3) {
    return new Vector3(Math.max(a.x, b.x), Math.max(a.y, b.y), Math.max(a.z, b.z));
  }
}

export class Color3 {
  constructor(public r = 0, public g = 0, public b = 0) {}
  scale(s: number) { return new Color3(this.r * s, this.g * s, this.b * s); }
  equals(other: Color3) { return this.r === other.r && this.g === other.g && this.b === other.b; }
  static Lerp(a: Color3, b: Color3, t: number) {
    return new Color3(a.r + (b.r - a.r) * t, a.g + (b.g - a.g) * t, a.b + (b.b - a.b) * t);
  }
}

export class Mesh {
  name: string;
  material: any = null;
  position = new Vector3();
  scaling = new Vector3(1, 1, 1);
  animations: any[] = [];
  parent: any = null;
  isVisible = true;
  isPickable = true;
  metadata: any = null;
  _children: Mesh[] = [];

  constructor(name: string, _scene?: any) {
    this.name = name;
    // Define parent as getter/setter after construction to avoid class field shadowing
    let _parent: any = null;
    Object.defineProperty(this, 'parent', {
      get: () => _parent,
      set: (p: any) => {
        _parent = p;
        if (p && p._children && !p._children.includes(this)) {
          p._children.push(this);
        }
      },
      enumerable: true,
      configurable: true,
    });
  }
  setEnabled(_v: boolean) {}
  isDisposed() { return false; }
  getTotalVertices() { return 10; }
  getChildMeshes(_directOnly?: boolean): Mesh[] { return this._children; }
  freezeNormals() {}
  freezeWorldMatrix() {}
  computeWorldMatrix(_force?: boolean) {}
  getAbsolutePosition() { return new Vector3(); }
  getBoundingInfo() {
    return {
      boundingBox: {
        minimumWorld: new Vector3(0, 0, 0),
        maximumWorld: new Vector3(1, 1, 1),
      }
    };
  }
  rotation = new Vector3();
  checkCollisions = false;
  clone(name: string) {
    const m = new Mesh(name);
    m.material = this.material;
    return m;
  }
  instantiateHierarchy(_parent?: any, _opts?: any, _onNewClone?: (source: any, clone: any) => void) {
    const root = new Mesh('hierarchy');
    if (_onNewClone) _onNewClone(this, root);
    return root;
  }
  dispose() {}
  static MergeMeshes(meshes: Mesh[], _disposeSource?: boolean, _allow32?: boolean, _target?: any, _subdivide?: boolean, _multiMat?: boolean): Mesh | null {
    if (!meshes || meshes.length === 0) return null;
    const merged = new Mesh(meshes[0].name + '_merged');
    return merged;
  }
}

export const MeshBuilder = {
  CreateSphere: (name: string, _opts: any, _scene: any) => new Mesh(name),
  CreateBox: (name: string, _opts: any, _scene: any) => new Mesh(name),
  CreateCylinder: (name: string, _opts: any, _scene: any) => new Mesh(name),
  CreateTorus: (name: string, _opts: any, _scene: any) => new Mesh(name),
  CreateGround: (name: string, _opts: any, _scene: any) => new Mesh(name),
  CreatePlane: (name: string, _opts: any, _scene: any) => new Mesh(name),
};

export class StandardMaterial {
  name: string;
  diffuseColor: any;
  emissiveColor: any;
  specularColor: any;
  alpha = 1;
  constructor(name: string, _scene: any) { this.name = name; }
  dispose() {}
}

export class GlowLayer {
  name: string;
  intensity = 0;
  customEmissiveColorSelector: any;
  constructor(name: string, _scene: any, _opts?: any) { this.name = name; }
  addIncludedOnlyMesh() {}
  removeIncludedOnlyMesh() {}
  dispose() {}
}

export class Animation {
  static ANIMATIONTYPE_FLOAT = 0;
  static ANIMATIONTYPE_VECTOR3 = 1;
  static ANIMATIONLOOPMODE_CYCLE = 1;
  name: string;
  constructor(name: string, ..._args: any[]) { this.name = name; }
  setKeys() {}
}

export class Light {
  name: string;
  intensity = 1;
  diffuse = new Color3(1, 1, 1);
  groundColor = new Color3(0, 0, 0);
  range = 10;
  constructor(name: string) { this.name = name; }
}

export class Scene {
  effectLayers: any[] = [];
  private _lights: Light[] = [];
  beginAnimation() {}
  stopAnimation() {}
  addLight(light: Light) { this._lights.push(light); }
  getLightByName(name: string): Light | null {
    return this._lights.find(l => l.name === name) || null;
  }
}

export class TransformNode {
  name: string;
  constructor(name: string, _scene?: any) { this.name = name; }
}

export class ActionManager {
  static OnIntersectionEnterTrigger = 0;
  constructor(_scene: any) {}
  registerAction() {}
}

export class ExecuteCodeAction {
  constructor(_trigger: any, _fn: any) {}
}

export class AbstractMesh extends Mesh {}

export class Texture {
  constructor(_url: string, _scene: any) {}
}

export class DynamicTexture {
  constructor(_name: string, _opts: any, _scene: any) {}
  getContext() { return { fillStyle: '', fillRect() {}, fillText() {} }; }
  update() {}
}

export class VertexData {
  positions: number[] = [];
  indices: number[] = [];
  normals: number[] = [];
  applyToMesh() {}
  static ComputeNormals() {}
}

export const SceneLoader = {
  ImportMeshAsync: async () => ({ meshes: [new Mesh('imported')] }),
};
