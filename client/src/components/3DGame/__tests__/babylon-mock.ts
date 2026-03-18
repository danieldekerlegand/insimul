/**
 * Babylon.js mock for testing procedural generators without WebGL.
 * This file is used as a module alias for @babylonjs/core in tests.
 */

export class Vector3 {
  constructor(public x = 0, public y = 0, public z = 0) {}
  clone() { return new Vector3(this.x, this.y, this.z); }
  scale(s: number) { return new Vector3(this.x * s, this.y * s, this.z * s); }
}

export class Color3 {
  constructor(public r = 0, public g = 0, public b = 0) {}
  scale(s: number) { return new Color3(this.r * s, this.g * s, this.b * s); }
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
  getChildMeshes(): Mesh[] { return this._children; }
  freezeNormals() {}
  clone(name: string) {
    const m = new Mesh(name);
    m.material = this.material;
    return m;
  }
  instantiateHierarchy() { return new Mesh('hierarchy'); }
  dispose() {}
}

export const MeshBuilder = {
  CreateSphere: (name: string, _opts: any, _scene: any) => new Mesh(name),
  CreateBox: (name: string, _opts: any, _scene: any) => new Mesh(name),
  CreateCylinder: (name: string, _opts: any, _scene: any) => new Mesh(name),
  CreateTorus: (name: string, _opts: any, _scene: any) => new Mesh(name),
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

export class Scene {
  effectLayers: any[] = [];
  beginAnimation() {}
  stopAnimation() {}
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
