/**
 * GLB-to-FBX Conversion Utility
 *
 * Converts GLB (binary glTF 2.0) files to FBX 7.5 ASCII format for import
 * into Unreal Engine. Handles mesh geometry, skeleton hierarchy, skin
 * weights, and animation keyframes.
 *
 * No external dependencies — parses GLB binary format directly and
 * writes FBX ASCII output that UE5's native importer accepts.
 */

// ─────────────────────────────────────────────
// GLB binary parsing types
// ─────────────────────────────────────────────

interface GlbHeader {
  magic: number;
  version: number;
  length: number;
}

interface GlbChunk {
  length: number;
  type: number;
  data: Uint8Array;
}

interface GltfJson {
  asset?: { version?: string; generator?: string };
  scene?: number;
  scenes?: Array<{ nodes?: number[] }>;
  nodes?: GltfNode[];
  meshes?: GltfMesh[];
  accessors?: GltfAccessor[];
  bufferViews?: GltfBufferView[];
  buffers?: GltfBuffer[];
  skins?: GltfSkin[];
  animations?: GltfAnimation[];
  materials?: GltfMaterial[];
}

interface GltfNode {
  name?: string;
  mesh?: number;
  skin?: number;
  children?: number[];
  translation?: [number, number, number];
  rotation?: [number, number, number, number];
  scale?: [number, number, number];
  matrix?: number[];
}

interface GltfMesh {
  name?: string;
  primitives: GltfPrimitive[];
}

interface GltfPrimitive {
  attributes: Record<string, number>;
  indices?: number;
  material?: number;
  mode?: number;
}

interface GltfAccessor {
  bufferView?: number;
  byteOffset?: number;
  componentType: number;
  count: number;
  type: string;
  min?: number[];
  max?: number[];
}

interface GltfBufferView {
  buffer: number;
  byteOffset?: number;
  byteLength: number;
  byteStride?: number;
  target?: number;
}

interface GltfBuffer {
  byteLength: number;
  uri?: string;
}

interface GltfSkin {
  name?: string;
  joints: number[];
  inverseBindMatrices?: number;
  skeleton?: number;
}

interface GltfAnimation {
  name?: string;
  channels: GltfAnimationChannel[];
  samplers: GltfAnimationSampler[];
}

interface GltfAnimationChannel {
  sampler: number;
  target: { node?: number; path: string };
}

interface GltfAnimationSampler {
  input: number;
  output: number;
  interpolation?: string;
}

interface GltfMaterial {
  name?: string;
}

// ─────────────────────────────────────────────
// Extracted data structures
// ─────────────────────────────────────────────

interface ExtractedMesh {
  name: string;
  positions: Float32Array;
  normals: Float32Array | null;
  uvs: Float32Array | null;
  indices: Uint32Array | null;
  jointIndices: Uint16Array | null;
  jointWeights: Float32Array | null;
}

interface ExtractedJoint {
  name: string;
  nodeIndex: number;
  parentIndex: number;
  translation: [number, number, number];
  rotation: [number, number, number, number];
  scale: [number, number, number];
}

interface ExtractedSkeleton {
  name: string;
  joints: ExtractedJoint[];
}

interface AnimationKeyframes {
  times: Float32Array;
  values: Float32Array;
}

interface ExtractedAnimCurve {
  jointName: string;
  property: 'translation' | 'rotation' | 'scale';
  keyframes: AnimationKeyframes;
}

interface ExtractedAnimation {
  name: string;
  curves: ExtractedAnimCurve[];
  duration: number;
}

export interface GlbToFbxResult {
  fbxContent: string;
  meshCount: number;
  jointCount: number;
  animationCount: number;
}

export interface ConversionOptions {
  /** Scale factor applied to all positions (default: 1.0) */
  scaleFactor?: number;
  /** Whether to include animations in the FBX output (default: true) */
  includeAnimations?: boolean;
  /** Whether to include skeleton/skin data (default: true) */
  includeSkeleton?: boolean;
}

// ─────────────────────────────────────────────
// GLB binary constants
// ─────────────────────────────────────────────

const GLB_MAGIC = 0x46546C67; // "glTF" in little-endian
const GLB_CHUNK_JSON = 0x4E4F534A;
const GLB_CHUNK_BIN = 0x004E4942;

// glTF component type → byte size
const COMPONENT_SIZES: Record<number, number> = {
  5120: 1,  // BYTE
  5121: 1,  // UNSIGNED_BYTE
  5122: 2,  // SHORT
  5123: 2,  // UNSIGNED_SHORT
  5125: 4,  // UNSIGNED_INT
  5126: 4,  // FLOAT
};

// glTF type → element count
const TYPE_COUNTS: Record<string, number> = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16,
};

// ─────────────────────────────────────────────
// GLB parser
// ─────────────────────────────────────────────

export function parseGlb(buffer: Buffer | Uint8Array): { json: GltfJson; bin: Uint8Array | null } {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  if (buffer.byteLength < 12) {
    throw new Error('GLB file too small: must be at least 12 bytes');
  }

  const header: GlbHeader = {
    magic: view.getUint32(0, true),
    version: view.getUint32(4, true),
    length: view.getUint32(8, true),
  };

  if (header.magic !== GLB_MAGIC) {
    throw new Error(`Invalid GLB magic: expected 0x${GLB_MAGIC.toString(16)}, got 0x${header.magic.toString(16)}`);
  }

  if (header.version !== 2) {
    throw new Error(`Unsupported GLB version: ${header.version} (only version 2 supported)`);
  }

  const chunks: GlbChunk[] = [];
  let offset = 12;

  while (offset < buffer.byteLength) {
    if (offset + 8 > buffer.byteLength) break;
    const chunkLength = view.getUint32(offset, true);
    const chunkType = view.getUint32(offset + 4, true);
    const chunkData = new Uint8Array(buffer.buffer, buffer.byteOffset + offset + 8, chunkLength);
    chunks.push({ length: chunkLength, type: chunkType, data: chunkData });
    offset += 8 + chunkLength;
  }

  const jsonChunk = chunks.find(c => c.type === GLB_CHUNK_JSON);
  if (!jsonChunk) {
    throw new Error('GLB file missing JSON chunk');
  }

  const jsonText = new TextDecoder().decode(jsonChunk.data);
  const json: GltfJson = JSON.parse(jsonText);
  const binChunk = chunks.find(c => c.type === GLB_CHUNK_BIN);

  return { json, bin: binChunk?.data ?? null };
}

// ─────────────────────────────────────────────
// Accessor data extraction
// ─────────────────────────────────────────────

function readAccessorData(
  json: GltfJson,
  bin: Uint8Array | null,
  accessorIndex: number,
): Float32Array | Uint16Array | Uint32Array {
  const accessor = json.accessors?.[accessorIndex];
  if (!accessor) throw new Error(`Accessor ${accessorIndex} not found`);

  const bufferView = json.bufferViews?.[accessor.bufferView ?? 0];
  if (!bufferView) throw new Error(`BufferView ${accessor.bufferView} not found`);
  if (!bin) throw new Error('No binary data available');

  const byteOffset = (bufferView.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
  const elementCount = TYPE_COUNTS[accessor.type] ?? 1;
  const totalElements = accessor.count * elementCount;

  const componentSize = COMPONENT_SIZES[accessor.componentType] ?? 4;
  const stride = bufferView.byteStride ?? (componentSize * elementCount);
  const isInterleaved = stride !== componentSize * elementCount;

  if (!isInterleaved) {
    const rawBuffer = bin.buffer;
    const rawOffset = bin.byteOffset + byteOffset;

    switch (accessor.componentType) {
      case 5126: // FLOAT
        return new Float32Array(rawBuffer, rawOffset, totalElements);
      case 5123: // UNSIGNED_SHORT
        return new Uint16Array(rawBuffer, rawOffset, totalElements);
      case 5125: // UNSIGNED_INT
        return new Uint32Array(rawBuffer, rawOffset, totalElements);
      case 5121: { // UNSIGNED_BYTE → promote to Uint16Array
        const bytes = new Uint8Array(rawBuffer, rawOffset, totalElements);
        const result = new Uint16Array(totalElements);
        for (let i = 0; i < totalElements; i++) result[i] = bytes[i];
        return result;
      }
      case 5122: { // SHORT → promote to Float32Array
        const shorts = new Int16Array(rawBuffer, rawOffset, totalElements);
        const result = new Float32Array(totalElements);
        for (let i = 0; i < totalElements; i++) result[i] = shorts[i];
        return result;
      }
      default:
        throw new Error(`Unsupported component type: ${accessor.componentType}`);
    }
  }

  // Interleaved: read element-by-element
  const result = new Float32Array(totalElements);
  for (let i = 0; i < accessor.count; i++) {
    const elementOffset = byteOffset + i * stride;
    for (let j = 0; j < elementCount; j++) {
      const compOffset = bin.byteOffset + elementOffset + j * componentSize;
      switch (accessor.componentType) {
        case 5126:
          result[i * elementCount + j] = new DataView(bin.buffer).getFloat32(compOffset, true);
          break;
        case 5123:
          result[i * elementCount + j] = new DataView(bin.buffer).getUint16(compOffset, true);
          break;
        case 5125:
          result[i * elementCount + j] = new DataView(bin.buffer).getUint32(compOffset, true);
          break;
        default:
          result[i * elementCount + j] = new DataView(bin.buffer).getFloat32(compOffset, true);
      }
    }
  }
  return result;
}

// ─────────────────────────────────────────────
// Data extraction from glTF JSON + binary
// ─────────────────────────────────────────────

function extractMeshes(json: GltfJson, bin: Uint8Array | null, scaleFactor: number): ExtractedMesh[] {
  if (!json.meshes) return [];

  const meshes: ExtractedMesh[] = [];

  for (let mi = 0; mi < json.meshes.length; mi++) {
    const mesh = json.meshes[mi];

    for (let pi = 0; pi < mesh.primitives.length; pi++) {
      const prim = mesh.primitives[pi];
      const attrs = prim.attributes;

      const posAccessor = attrs.POSITION;
      if (posAccessor === undefined) continue;

      const positions = new Float32Array(readAccessorData(json, bin, posAccessor));
      if (scaleFactor !== 1.0) {
        for (let i = 0; i < positions.length; i++) positions[i] *= scaleFactor;
      }

      const normals = attrs.NORMAL !== undefined
        ? new Float32Array(readAccessorData(json, bin, attrs.NORMAL))
        : null;

      const uvs = attrs.TEXCOORD_0 !== undefined
        ? new Float32Array(readAccessorData(json, bin, attrs.TEXCOORD_0))
        : null;

      const indices = prim.indices !== undefined
        ? new Uint32Array(readAccessorData(json, bin, prim.indices))
        : null;

      const jointIndices = attrs.JOINTS_0 !== undefined
        ? new Uint16Array(readAccessorData(json, bin, attrs.JOINTS_0))
        : null;

      const jointWeights = attrs.WEIGHTS_0 !== undefined
        ? new Float32Array(readAccessorData(json, bin, attrs.WEIGHTS_0))
        : null;

      const name = mesh.primitives.length === 1
        ? (mesh.name || `Mesh_${mi}`)
        : `${mesh.name || `Mesh_${mi}`}_prim${pi}`;

      meshes.push({ name, positions, normals, uvs, indices, jointIndices, jointWeights });
    }
  }

  return meshes;
}

function getNodeTransform(node: GltfNode): {
  translation: [number, number, number];
  rotation: [number, number, number, number];
  scale: [number, number, number];
} {
  return {
    translation: node.translation ? [...node.translation] : [0, 0, 0],
    rotation: node.rotation ? [...node.rotation] : [0, 0, 0, 1],
    scale: node.scale ? [...node.scale] : [1, 1, 1],
  };
}

function extractSkeleton(json: GltfJson): ExtractedSkeleton | null {
  if (!json.skins?.length || !json.nodes) return null;

  const skin = json.skins[0];
  const joints: ExtractedJoint[] = [];

  // Build parent lookup from node hierarchy
  const parentMap = new Map<number, number>();
  for (let i = 0; i < json.nodes.length; i++) {
    const node = json.nodes[i];
    if (node.children) {
      for (const child of node.children) {
        parentMap.set(child, i);
      }
    }
  }

  const jointSet = new Set(skin.joints);

  for (let ji = 0; ji < skin.joints.length; ji++) {
    const nodeIndex = skin.joints[ji];
    const node = json.nodes[nodeIndex];
    const transform = getNodeTransform(node);

    // Find parent joint index (-1 if root)
    let parentIndex = -1;
    const parentNodeIndex = parentMap.get(nodeIndex);
    if (parentNodeIndex !== undefined && jointSet.has(parentNodeIndex)) {
      parentIndex = skin.joints.indexOf(parentNodeIndex);
    }

    joints.push({
      name: node.name || `Joint_${ji}`,
      nodeIndex,
      parentIndex,
      ...transform,
    });
  }

  return { name: skin.name || 'Armature', joints };
}

function extractAnimations(json: GltfJson, bin: Uint8Array | null): ExtractedAnimation[] {
  if (!json.animations || !json.nodes) return [];

  const nodeNames = json.nodes.map((n, i) => n.name || `Node_${i}`);
  const animations: ExtractedAnimation[] = [];

  for (const anim of json.animations) {
    const curves: ExtractedAnimCurve[] = [];
    let maxTime = 0;

    for (const channel of anim.channels) {
      if (channel.target.node === undefined) continue;

      const sampler = anim.samplers[channel.sampler];
      const times = new Float32Array(readAccessorData(json, bin, sampler.input));
      const values = new Float32Array(readAccessorData(json, bin, sampler.output));

      const lastTime = times.length > 0 ? times[times.length - 1] : 0;
      if (lastTime > maxTime) maxTime = lastTime;

      const property = channel.target.path as 'translation' | 'rotation' | 'scale';
      if (property !== 'translation' && property !== 'rotation' && property !== 'scale') continue;

      curves.push({
        jointName: nodeNames[channel.target.node],
        property,
        keyframes: { times, values },
      });
    }

    animations.push({
      name: anim.name || `Animation_${animations.length}`,
      curves,
      duration: maxTime,
    });
  }

  return animations;
}

// ─────────────────────────────────────────────
// FBX 7.5 ASCII writer
// ─────────────────────────────────────────────

let fbxIdCounter = 1000000000;

function nextFbxId(): number {
  return fbxIdCounter++;
}

/** Reset ID counter (for testing determinism) */
export function resetFbxIdCounter(): void {
  fbxIdCounter = 1000000000;
}

function formatFloat(n: number): string {
  return Number.isInteger(n) ? `${n}.0` : n.toString();
}

function quaternionToEulerDegrees(q: [number, number, number, number]): [number, number, number] {
  const [x, y, z, w] = q;

  // Roll (X)
  const sinr = 2.0 * (w * x + y * z);
  const cosr = 1.0 - 2.0 * (x * x + y * y);
  const roll = Math.atan2(sinr, cosr);

  // Pitch (Y)
  const sinp = 2.0 * (w * y - z * x);
  const pitch = Math.abs(sinp) >= 1
    ? Math.sign(sinp) * Math.PI / 2
    : Math.asin(sinp);

  // Yaw (Z)
  const siny = 2.0 * (w * z + x * y);
  const cosy = 1.0 - 2.0 * (y * y + z * z);
  const yaw = Math.atan2(siny, cosy);

  const toDeg = 180.0 / Math.PI;
  return [roll * toDeg, pitch * toDeg, yaw * toDeg];
}

function writeFbxHeader(): string {
  return `; FBX 7.5.0 project file
; Generated by Insimul GLB-to-FBX converter
; ─────────────────────────────────────────
FBXHeaderExtension:  {
\tFBXHeaderVersion: 1003
\tFBXVersion: 7500
\tCreator: "Insimul GLB-to-FBX Converter"
}

`;
}

function writeFbxGlobalSettings(): string {
  return `GlobalSettings:  {
\tVersion: 1000
\tProperties70:  {
\t\tP: "UpAxis", "int", "Integer", "",1
\t\tP: "UpAxisSign", "int", "Integer", "",1
\t\tP: "FrontAxis", "int", "Integer", "",2
\t\tP: "FrontAxisSign", "int", "Integer", "",1
\t\tP: "CoordAxis", "int", "Integer", "",0
\t\tP: "CoordAxisSign", "int", "Integer", "",1
\t\tP: "OriginalUpAxis", "int", "Integer", "",1
\t\tP: "OriginalUpAxisSign", "int", "Integer", "",1
\t\tP: "UnitScaleFactor", "double", "Number", "",1.0
\t\tP: "OriginalUnitScaleFactor", "double", "Number", "",1.0
\t}
}

`;
}

function writeFbxDefinitions(
  meshCount: number,
  jointCount: number,
  animCount: number,
  curveCount: number,
): string {
  let totalObjects = meshCount * 2; // Model + Geometry per mesh
  if (jointCount > 0) totalObjects += jointCount + 2; // joints + deformer + null root
  if (animCount > 0) totalObjects += animCount * 2 + curveCount * 2; // stack + layer + curveNodes + curves

  const lines: string[] = [];
  lines.push(`Definitions:  {`);
  lines.push(`\tVersion: 100`);
  lines.push(`\tCount: ${totalObjects}`);

  lines.push(`\tObjectType: "GlobalSettings" {`);
  lines.push(`\t\tCount: 1`);
  lines.push(`\t}`);

  if (meshCount > 0) {
    lines.push(`\tObjectType: "Geometry" {`);
    lines.push(`\t\tCount: ${meshCount}`);
    lines.push(`\t}`);
    lines.push(`\tObjectType: "Model" {`);
    lines.push(`\t\tCount: ${meshCount + jointCount + (jointCount > 0 ? 1 : 0)}`);
    lines.push(`\t}`);
  }

  if (jointCount > 0) {
    lines.push(`\tObjectType: "Deformer" {`);
    lines.push(`\t\tCount: ${jointCount + 1}`); // 1 skin + N clusters
    lines.push(`\t}`);
    lines.push(`\tObjectType: "NodeAttribute" {`);
    lines.push(`\t\tCount: ${jointCount}`);
    lines.push(`\t}`);
  }

  if (animCount > 0) {
    lines.push(`\tObjectType: "AnimationStack" {`);
    lines.push(`\t\tCount: ${animCount}`);
    lines.push(`\t}`);
    lines.push(`\tObjectType: "AnimationLayer" {`);
    lines.push(`\t\tCount: ${animCount}`);
    lines.push(`\t}`);
    lines.push(`\tObjectType: "AnimationCurveNode" {`);
    lines.push(`\t\tCount: ${curveCount}`);
    lines.push(`\t}`);
    lines.push(`\tObjectType: "AnimationCurve" {`);
    lines.push(`\t\tCount: ${curveCount}`);
    lines.push(`\t}`);
  }

  lines.push(`}`);
  lines.push('');
  return lines.join('\n');
}

function formatArray(arr: ArrayLike<number>, formatter: (n: number) => string = formatFloat): string {
  const parts: string[] = [];
  for (let i = 0; i < arr.length; i++) {
    parts.push(formatter(arr[i]));
  }
  return parts.join(',');
}

interface FbxObjectEntry {
  content: string;
  id: number;
  type: string;
  name: string;
}

interface FbxConnection {
  childId: number;
  parentId: number;
  property?: string;
}

function buildMeshObjects(
  meshes: ExtractedMesh[],
): { objects: FbxObjectEntry[]; connections: FbxConnection[] } {
  const objects: FbxObjectEntry[] = [];
  const connections: FbxConnection[] = [];

  for (const mesh of meshes) {
    const geoId = nextFbxId();
    const modelId = nextFbxId();

    // Geometry object
    const vertCount = mesh.positions.length / 3;
    const lines: string[] = [];
    lines.push(`\tGeometry: ${geoId}, "Geometry::${mesh.name}", "Mesh" {`);

    // Vertices
    lines.push(`\t\tVertices: *${mesh.positions.length} {`);
    lines.push(`\t\t\ta: ${formatArray(mesh.positions)}`);
    lines.push(`\t\t}`);

    // Polygon vertex indices
    if (mesh.indices) {
      const fbxIndices: number[] = [];
      for (let i = 0; i < mesh.indices.length; i += 3) {
        fbxIndices.push(mesh.indices[i]);
        fbxIndices.push(mesh.indices[i + 1]);
        // FBX negates last index of each polygon and subtracts 1
        fbxIndices.push(-(mesh.indices[i + 2]) - 1);
      }
      lines.push(`\t\tPolygonVertexIndex: *${fbxIndices.length} {`);
      lines.push(`\t\t\ta: ${fbxIndices.join(',')}`);
      lines.push(`\t\t}`);
    } else {
      // Non-indexed: every 3 vertices form a triangle
      const fbxIndices: number[] = [];
      for (let i = 0; i < vertCount; i += 3) {
        fbxIndices.push(i);
        fbxIndices.push(i + 1);
        fbxIndices.push(-(i + 2) - 1);
      }
      lines.push(`\t\tPolygonVertexIndex: *${fbxIndices.length} {`);
      lines.push(`\t\t\ta: ${fbxIndices.join(',')}`);
      lines.push(`\t\t}`);
    }

    // Normals
    if (mesh.normals) {
      lines.push(`\t\tLayerElementNormal: 0 {`);
      lines.push(`\t\t\tVersion: 102`);
      lines.push(`\t\t\tName: "Normals"`);
      lines.push(`\t\t\tMappingInformationType: "ByVertice"`);
      lines.push(`\t\t\tReferenceInformationType: "Direct"`);
      lines.push(`\t\t\tNormals: *${mesh.normals.length} {`);
      lines.push(`\t\t\t\ta: ${formatArray(mesh.normals)}`);
      lines.push(`\t\t\t}`);
      lines.push(`\t\t}`);
    }

    // UVs
    if (mesh.uvs) {
      lines.push(`\t\tLayerElementUV: 0 {`);
      lines.push(`\t\t\tVersion: 101`);
      lines.push(`\t\t\tName: "UVMap"`);
      lines.push(`\t\t\tMappingInformationType: "ByVertice"`);
      lines.push(`\t\t\tReferenceInformationType: "Direct"`);
      lines.push(`\t\t\tUV: *${mesh.uvs.length} {`);
      lines.push(`\t\t\t\ta: ${formatArray(mesh.uvs)}`);
      lines.push(`\t\t\t}`);
      lines.push(`\t\t}`);
    }

    // Layer definition
    lines.push(`\t\tLayer: 0 {`);
    lines.push(`\t\t\tVersion: 100`);
    if (mesh.normals) {
      lines.push(`\t\t\tLayerElement:  {`);
      lines.push(`\t\t\t\tType: "LayerElementNormal"`);
      lines.push(`\t\t\t\tTypedIndex: 0`);
      lines.push(`\t\t\t}`);
    }
    if (mesh.uvs) {
      lines.push(`\t\t\tLayerElement:  {`);
      lines.push(`\t\t\t\tType: "LayerElementUV"`);
      lines.push(`\t\t\t\tTypedIndex: 0`);
      lines.push(`\t\t\t}`);
    }
    lines.push(`\t\t}`);

    lines.push(`\t}`);
    objects.push({ content: lines.join('\n'), id: geoId, type: 'Geometry', name: mesh.name });

    // Model object
    const modelLines: string[] = [];
    modelLines.push(`\tModel: ${modelId}, "Model::${mesh.name}", "Mesh" {`);
    modelLines.push(`\t\tVersion: 232`);
    modelLines.push(`\t\tProperties70:  {`);
    modelLines.push(`\t\t\tP: "DefaultAttributeIndex", "int", "Integer", "",0`);
    modelLines.push(`\t\t}`);
    modelLines.push(`\t\tShading: T`);
    modelLines.push(`\t\tCulling: "CullingOff"`);
    modelLines.push(`\t}`);
    objects.push({ content: modelLines.join('\n'), id: modelId, type: 'Model', name: mesh.name });

    // Connect geometry to model
    connections.push({ childId: geoId, parentId: modelId });
    // Connect model to root (0)
    connections.push({ childId: modelId, parentId: 0 });
  }

  return { objects, connections };
}

function buildSkeletonObjects(
  skeleton: ExtractedSkeleton,
  meshObjects: FbxObjectEntry[],
  meshes: ExtractedMesh[],
): { objects: FbxObjectEntry[]; connections: FbxConnection[] } {
  const objects: FbxObjectEntry[] = [];
  const connections: FbxConnection[] = [];

  // Root null node for skeleton
  const rootId = nextFbxId();
  const rootLines: string[] = [];
  rootLines.push(`\tModel: ${rootId}, "Model::${skeleton.name}", "Null" {`);
  rootLines.push(`\t\tVersion: 232`);
  rootLines.push(`\t\tProperties70:  {`);
  rootLines.push(`\t\t\tP: "DefaultAttributeIndex", "int", "Integer", "",0`);
  rootLines.push(`\t\t}`);
  rootLines.push(`\t}`);
  objects.push({ content: rootLines.join('\n'), id: rootId, type: 'Model', name: skeleton.name });
  connections.push({ childId: rootId, parentId: 0 });

  // Joint models + NodeAttributes
  const jointIds: number[] = [];
  const jointAttrIds: number[] = [];

  for (let i = 0; i < skeleton.joints.length; i++) {
    const joint = skeleton.joints[i];
    const attrId = nextFbxId();
    const jointId = nextFbxId();

    jointAttrIds.push(attrId);
    jointIds.push(jointId);

    // NodeAttribute (LimbNode)
    const attrLines: string[] = [];
    attrLines.push(`\tNodeAttribute: ${attrId}, "NodeAttribute::${joint.name}", "LimbNode" {`);
    attrLines.push(`\t\tTypeFlags: "Skeleton"`);
    attrLines.push(`\t}`);
    objects.push({ content: attrLines.join('\n'), id: attrId, type: 'NodeAttribute', name: joint.name });

    // Joint model
    const euler = quaternionToEulerDegrees(joint.rotation);
    const jLines: string[] = [];
    jLines.push(`\tModel: ${jointId}, "Model::${joint.name}", "LimbNode" {`);
    jLines.push(`\t\tVersion: 232`);
    jLines.push(`\t\tProperties70:  {`);
    jLines.push(`\t\t\tP: "Lcl Translation", "Lcl Translation", "", "A",${formatFloat(joint.translation[0])},${formatFloat(joint.translation[1])},${formatFloat(joint.translation[2])}`);
    jLines.push(`\t\t\tP: "Lcl Rotation", "Lcl Rotation", "", "A",${formatFloat(euler[0])},${formatFloat(euler[1])},${formatFloat(euler[2])}`);
    jLines.push(`\t\t\tP: "Lcl Scaling", "Lcl Scaling", "", "A",${formatFloat(joint.scale[0])},${formatFloat(joint.scale[1])},${formatFloat(joint.scale[2])}`);
    jLines.push(`\t\t\tP: "DefaultAttributeIndex", "int", "Integer", "",0`);
    jLines.push(`\t\t}`);
    jLines.push(`\t\tShading: T`);
    jLines.push(`\t\tCulling: "CullingOff"`);
    jLines.push(`\t}`);
    objects.push({ content: jLines.join('\n'), id: jointId, type: 'Model', name: joint.name });

    // Connect attribute to joint
    connections.push({ childId: attrId, parentId: jointId });
    // Connect joint to parent
    const parentFbxId = joint.parentIndex >= 0 ? jointIds[joint.parentIndex] : rootId;
    connections.push({ childId: jointId, parentId: parentFbxId });
  }

  // Skin deformer + sub-deformers (clusters) for each mesh with skin data
  for (let mi = 0; mi < meshes.length; mi++) {
    const mesh = meshes[mi];
    if (!mesh.jointIndices || !mesh.jointWeights) continue;

    const meshModel = meshObjects.find(o => o.type === 'Model' && o.name === mesh.name);
    if (!meshModel) continue;

    const skinId = nextFbxId();
    const skinLines: string[] = [];
    skinLines.push(`\tDeformer: ${skinId}, "Deformer::Skin", "Skin" {`);
    skinLines.push(`\t\tVersion: 101`);
    skinLines.push(`\t\tLink_DeformAcuracy: 50`);
    skinLines.push(`\t}`);
    objects.push({ content: skinLines.join('\n'), id: skinId, type: 'Deformer', name: 'Skin' });

    // Connect skin to mesh geometry
    const meshGeo = meshObjects.find(o => o.type === 'Geometry' && o.name === mesh.name);
    if (meshGeo) connections.push({ childId: skinId, parentId: meshGeo.id });

    // Build per-joint vertex/weight lists
    const vertCount = mesh.positions.length / 3;
    const jointVertices = new Map<number, { indices: number[]; weights: number[] }>();

    for (let vi = 0; vi < vertCount; vi++) {
      for (let wi = 0; wi < 4; wi++) {
        const jointIdx = mesh.jointIndices[vi * 4 + wi];
        const weight = mesh.jointWeights[vi * 4 + wi];
        if (weight <= 0) continue;

        let entry = jointVertices.get(jointIdx);
        if (!entry) {
          entry = { indices: [], weights: [] };
          jointVertices.set(jointIdx, entry);
        }
        entry.indices.push(vi);
        entry.weights.push(weight);
      }
    }

    // Create cluster for each joint that has influence
    for (const [jointIdx, { indices, weights }] of Array.from(jointVertices.entries())) {
      if (jointIdx >= skeleton.joints.length) continue;

      const clusterId = nextFbxId();
      const joint = skeleton.joints[jointIdx];
      const cLines: string[] = [];
      cLines.push(`\tDeformer: ${clusterId}, "SubDeformer::${joint.name}", "Cluster" {`);
      cLines.push(`\t\tVersion: 100`);
      cLines.push(`\t\tIndexes: *${indices.length} {`);
      cLines.push(`\t\t\ta: ${indices.join(',')}`);
      cLines.push(`\t\t}`);
      cLines.push(`\t\tWeights: *${weights.length} {`);
      cLines.push(`\t\t\ta: ${formatArray(new Float32Array(weights))}`);
      cLines.push(`\t\t}`);
      cLines.push(`\t}`);
      objects.push({ content: cLines.join('\n'), id: clusterId, type: 'Deformer', name: joint.name });

      connections.push({ childId: clusterId, parentId: skinId });
      if (jointIdx < jointIds.length) {
        connections.push({ childId: jointIds[jointIdx], parentId: clusterId });
      }
    }
  }

  return { objects, connections };
}

function buildAnimationObjects(
  animations: ExtractedAnimation[],
  skeletonJointNames: Set<string>,
): { objects: FbxObjectEntry[]; connections: FbxConnection[]; curveCount: number } {
  const objects: FbxObjectEntry[] = [];
  const connections: FbxConnection[] = [];
  let curveCount = 0;

  for (const anim of animations) {
    const stackId = nextFbxId();
    const layerId = nextFbxId();

    // AnimationStack
    const fps = 30.0;
    const durationTicks = Math.ceil(anim.duration * fps * 46186158000 / fps);
    const sLines: string[] = [];
    sLines.push(`\tAnimationStack: ${stackId}, "AnimStack::${anim.name}", "" {`);
    sLines.push(`\t\tProperties70:  {`);
    sLines.push(`\t\t\tP: "LocalStop", "KTime", "Time", "",${durationTicks}`);
    sLines.push(`\t\t}`);
    sLines.push(`\t}`);
    objects.push({ content: sLines.join('\n'), id: stackId, type: 'AnimationStack', name: anim.name });

    // AnimationLayer
    const lLines: string[] = [];
    lLines.push(`\tAnimationLayer: ${layerId}, "AnimLayer::BaseLayer", "" {`);
    lLines.push(`\t}`);
    objects.push({ content: lLines.join('\n'), id: layerId, type: 'AnimationLayer', name: 'BaseLayer' });

    connections.push({ childId: layerId, parentId: stackId });

    // Group curves by joint + property
    for (const curve of anim.curves) {
      if (!skeletonJointNames.has(curve.jointName)) continue;

      const curveNodeId = nextFbxId();
      const curveId = nextFbxId();
      curveCount++;

      const propertyMap: Record<string, string> = {
        translation: 'T',
        rotation: 'R',
        scale: 'S',
      };
      const propChar = propertyMap[curve.property] || 'T';

      // Convert times to FBX KTime (1 second = 46186158000 ticks)
      const kTimes: number[] = [];
      for (let i = 0; i < curve.keyframes.times.length; i++) {
        kTimes.push(Math.round(curve.keyframes.times[i] * 46186158000));
      }

      // For rotation, convert quaternions to euler degrees
      let values: number[];
      const componentsPerKey = curve.property === 'rotation' ? 4 : 3;
      const keyCount = curve.keyframes.times.length;

      if (curve.property === 'rotation') {
        values = [];
        for (let i = 0; i < keyCount; i++) {
          const offset = i * componentsPerKey;
          const q: [number, number, number, number] = [
            curve.keyframes.values[offset],
            curve.keyframes.values[offset + 1],
            curve.keyframes.values[offset + 2],
            curve.keyframes.values[offset + 3],
          ];
          const euler = quaternionToEulerDegrees(q);
          values.push(euler[0], euler[1], euler[2]);
        }
      } else {
        values = [];
        for (let i = 0; i < keyCount; i++) {
          const offset = i * componentsPerKey;
          for (let c = 0; c < 3; c++) {
            values.push(curve.keyframes.values[offset + c]);
          }
        }
      }

      // AnimationCurveNode
      const cnLines: string[] = [];
      cnLines.push(`\tAnimationCurveNode: ${curveNodeId}, "AnimCurveNode::${propChar}", "" {`);
      cnLines.push(`\t\tProperties70:  {`);
      if (curve.property === 'translation') {
        cnLines.push(`\t\t\tP: "d|X", "Number", "", "A",0.0`);
        cnLines.push(`\t\t\tP: "d|Y", "Number", "", "A",0.0`);
        cnLines.push(`\t\t\tP: "d|Z", "Number", "", "A",0.0`);
      } else if (curve.property === 'rotation') {
        cnLines.push(`\t\t\tP: "d|X", "Number", "", "A",0.0`);
        cnLines.push(`\t\t\tP: "d|Y", "Number", "", "A",0.0`);
        cnLines.push(`\t\t\tP: "d|Z", "Number", "", "A",0.0`);
      } else {
        cnLines.push(`\t\t\tP: "d|X", "Number", "", "A",1.0`);
        cnLines.push(`\t\t\tP: "d|Y", "Number", "", "A",1.0`);
        cnLines.push(`\t\t\tP: "d|Z", "Number", "", "A",1.0`);
      }
      cnLines.push(`\t\t}`);
      cnLines.push(`\t}`);
      objects.push({ content: cnLines.join('\n'), id: curveNodeId, type: 'AnimationCurveNode', name: propChar });

      // AnimationCurve (single curve with all values interleaved as X,Y,Z sets)
      const cLines: string[] = [];
      cLines.push(`\tAnimationCurve: ${curveId}, "AnimCurve::${curve.jointName}_${propChar}", "" {`);
      cLines.push(`\t\tDefault: 0`);
      cLines.push(`\t\tKeyVer: 4009`);
      cLines.push(`\t\tKeyTime: *${kTimes.length} {`);
      cLines.push(`\t\t\ta: ${kTimes.join(',')}`);
      cLines.push(`\t\t}`);
      cLines.push(`\t\tKeyValueFloat: *${values.length} {`);
      cLines.push(`\t\t\ta: ${formatArray(new Float32Array(values))}`);
      cLines.push(`\t\t}`);
      cLines.push(`\t}`);
      objects.push({ content: cLines.join('\n'), id: curveId, type: 'AnimationCurve', name: `${curve.jointName}_${propChar}` });

      // Connect curve to curveNode, curveNode to layer
      connections.push({ childId: curveId, parentId: curveNodeId });
      connections.push({ childId: curveNodeId, parentId: layerId });
    }
  }

  return { objects, connections, curveCount };
}

function writeConnections(connections: FbxConnection[]): string {
  const lines: string[] = [];
  lines.push('Connections:  {');

  for (const conn of connections) {
    if (conn.property) {
      lines.push(`\tC: "OP",${conn.childId},${conn.parentId}, "${conn.property}"`);
    } else {
      lines.push(`\tC: "OO",${conn.childId},${conn.parentId}`);
    }
  }

  lines.push('}');
  lines.push('');
  return lines.join('\n');
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

/**
 * Convert a GLB buffer to FBX 7.5 ASCII format.
 *
 * Extracts mesh geometry, skeleton hierarchy, skin weights, and animation
 * keyframes from the GLB and writes them as FBX ASCII that Unreal Engine
 * can import natively.
 */
export function convertGlbToFbx(
  glbBuffer: Buffer | Uint8Array,
  options: ConversionOptions = {},
): GlbToFbxResult {
  const scaleFactor = options.scaleFactor ?? 1.0;
  const includeAnimations = options.includeAnimations ?? true;
  const includeSkeleton = options.includeSkeleton ?? true;

  resetFbxIdCounter();

  // Parse GLB
  const { json, bin } = parseGlb(glbBuffer);

  // Extract data
  const meshes = extractMeshes(json, bin, scaleFactor);
  const skeleton = includeSkeleton ? extractSkeleton(json) : null;
  // Skeletal animations require a skeleton — skip if skeleton is excluded
  const animations = (includeAnimations && skeleton) ? extractAnimations(json, bin) : [];

  // Build FBX objects
  const meshResult = buildMeshObjects(meshes);
  const allObjects: FbxObjectEntry[] = [...meshResult.objects];
  const allConnections: FbxConnection[] = [...meshResult.connections];

  let jointCount = 0;
  if (skeleton) {
    jointCount = skeleton.joints.length;
    const skelResult = buildSkeletonObjects(skeleton, meshResult.objects, meshes);
    allObjects.push(...skelResult.objects);
    allConnections.push(...skelResult.connections);
  }

  let curveCount = 0;
  if (animations.length > 0 && skeleton) {
    const jointNames = new Set(skeleton.joints.map(j => j.name));
    const animResult = buildAnimationObjects(animations, jointNames);
    allObjects.push(...animResult.objects);
    allConnections.push(...animResult.connections);
    curveCount = animResult.curveCount;
  }

  // Assemble FBX ASCII document
  const parts: string[] = [];
  parts.push(writeFbxHeader());
  parts.push(writeFbxGlobalSettings());
  parts.push(writeFbxDefinitions(meshes.length, jointCount, animations.length, curveCount));

  // Objects section
  parts.push('Objects:  {');
  for (const obj of allObjects) {
    parts.push(obj.content);
  }
  parts.push('}');
  parts.push('');

  // Connections section
  parts.push(writeConnections(allConnections));

  return {
    fbxContent: parts.join('\n'),
    meshCount: meshes.length,
    jointCount,
    animationCount: animations.length,
  };
}

/**
 * Convert a GLB buffer to FBX and return the result as a Buffer.
 * Convenience wrapper for use in the asset bundler pipeline.
 */
export function convertGlbBufferToFbx(
  glbBuffer: Buffer,
  options: ConversionOptions = {},
): { fbxBuffer: Buffer; stats: Omit<GlbToFbxResult, 'fbxContent'> } {
  const result = convertGlbToFbx(glbBuffer, options);
  return {
    fbxBuffer: Buffer.from(result.fbxContent, 'utf-8'),
    stats: {
      meshCount: result.meshCount,
      jointCount: result.jointCount,
      animationCount: result.animationCount,
    },
  };
}
