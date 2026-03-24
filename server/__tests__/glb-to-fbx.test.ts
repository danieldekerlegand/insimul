/**
 * Tests for GLB-to-FBX conversion utility.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  parseGlb,
  convertGlbToFbx,
  convertGlbBufferToFbx,
  resetFbxIdCounter,
} from '../services/game-export/unreal/glb-to-fbx';

// ─────────────────────────────────────────────
// Helper: build a minimal valid GLB buffer
// ─────────────────────────────────────────────

function buildGlbBuffer(json: object, binData?: Float32Array | Uint8Array): Buffer {
  const jsonString = JSON.stringify(json);
  // Pad JSON to 4-byte alignment
  const jsonPadded = jsonString + ' '.repeat((4 - (jsonString.length % 4)) % 4);
  const jsonBytes = Buffer.from(jsonPadded, 'utf-8');

  let binBytes: Buffer | null = null;
  if (binData) {
    const raw = Buffer.from(binData.buffer, binData.byteOffset, binData.byteLength);
    // Pad BIN to 4-byte alignment
    const pad = (4 - (raw.length % 4)) % 4;
    binBytes = Buffer.alloc(raw.length + pad);
    raw.copy(binBytes);
  }

  const headerSize = 12;
  const jsonChunkSize = 8 + jsonBytes.length;
  const binChunkSize = binBytes ? 8 + binBytes.length : 0;
  const totalSize = headerSize + jsonChunkSize + binChunkSize;

  const buffer = Buffer.alloc(totalSize);
  let offset = 0;

  // Header
  buffer.writeUInt32LE(0x46546C67, offset); offset += 4; // magic "glTF"
  buffer.writeUInt32LE(2, offset); offset += 4;           // version
  buffer.writeUInt32LE(totalSize, offset); offset += 4;   // total length

  // JSON chunk
  buffer.writeUInt32LE(jsonBytes.length, offset); offset += 4;
  buffer.writeUInt32LE(0x4E4F534A, offset); offset += 4; // chunk type JSON
  jsonBytes.copy(buffer, offset); offset += jsonBytes.length;

  // BIN chunk
  if (binBytes) {
    buffer.writeUInt32LE(binBytes.length, offset); offset += 4;
    buffer.writeUInt32LE(0x004E4942, offset); offset += 4; // chunk type BIN
    binBytes.copy(buffer, offset);
  }

  return buffer;
}

/**
 * Create a minimal GLB with a single triangle mesh.
 */
function makeTriangleGlb() {
  // 3 vertices: (0,0,0), (1,0,0), (0,1,0)
  const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
  // 3 normals: all pointing +Z
  const normals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]);
  // 2 UVs per vertex
  const uvs = new Float32Array([0, 0, 1, 0, 0, 1]);
  // Triangle indices
  const indices = new Uint16Array([0, 1, 2]);

  const posBytes = positions.byteLength;
  const normBytes = normals.byteLength;
  const uvBytes = uvs.byteLength;
  const idxBytes = indices.byteLength;

  // Combine into single binary buffer
  const totalBin = posBytes + normBytes + uvBytes + idxBytes;
  const binArray = new Uint8Array(totalBin);
  let binOffset = 0;
  binArray.set(new Uint8Array(positions.buffer), binOffset); binOffset += posBytes;
  binArray.set(new Uint8Array(normals.buffer), binOffset); binOffset += normBytes;
  binArray.set(new Uint8Array(uvs.buffer), binOffset); binOffset += uvBytes;
  binArray.set(new Uint8Array(indices.buffer), binOffset);

  const json = {
    asset: { version: '2.0', generator: 'test' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ name: 'TriangleMesh', mesh: 0 }],
    meshes: [{
      name: 'Triangle',
      primitives: [{
        attributes: {
          POSITION: 0,
          NORMAL: 1,
          TEXCOORD_0: 2,
        },
        indices: 3,
      }],
    }],
    accessors: [
      { bufferView: 0, componentType: 5126, count: 3, type: 'VEC3', min: [0, 0, 0], max: [1, 1, 0] },
      { bufferView: 1, componentType: 5126, count: 3, type: 'VEC3' },
      { bufferView: 2, componentType: 5126, count: 3, type: 'VEC2' },
      { bufferView: 3, componentType: 5123, count: 3, type: 'SCALAR' },
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: posBytes },
      { buffer: 0, byteOffset: posBytes, byteLength: normBytes },
      { buffer: 0, byteOffset: posBytes + normBytes, byteLength: uvBytes },
      { buffer: 0, byteOffset: posBytes + normBytes + uvBytes, byteLength: idxBytes },
    ],
    buffers: [{ byteLength: totalBin }],
  };

  return buildGlbBuffer(json, binArray);
}

/**
 * Create a GLB with a mesh, skeleton (2 joints), and a simple animation.
 */
function makeSkinnedAnimatedGlb() {
  // 4 vertices forming a quad
  const positions = new Float32Array([
    -0.5, 0, 0,
    0.5, 0, 0,
    0.5, 1, 0,
    -0.5, 1, 0,
  ]);
  const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

  // Skin data: 4 joints per vertex (we only use 2)
  const joints = new Uint8Array([
    0, 1, 0, 0,
    0, 1, 0, 0,
    1, 0, 0, 0,
    1, 0, 0, 0,
  ]);
  const weights = new Float32Array([
    1, 0, 0, 0,
    1, 0, 0, 0,
    0.8, 0.2, 0, 0,
    0.8, 0.2, 0, 0,
  ]);

  // Animation: 2 keyframes of rotation for joint 1
  const animTimes = new Float32Array([0.0, 1.0]);
  // Quaternion values (identity, then 45deg around Z)
  const animValues = new Float32Array([
    0, 0, 0, 1,                       // keyframe 0: identity
    0, 0, 0.3826834, 0.9238795,       // keyframe 1: ~45deg Z rotation
  ]);

  // Combine binary data
  const posBytes = positions.byteLength;
  const idxBytes = indices.byteLength;
  const jointsBytes = joints.byteLength;
  const weightsBytes = weights.byteLength;
  const timesBytes = animTimes.byteLength;
  const valuesBytes = animValues.byteLength;

  const totalBin = posBytes + idxBytes + jointsBytes + weightsBytes + timesBytes + valuesBytes;
  const binArray = new Uint8Array(totalBin);
  let off = 0;
  binArray.set(new Uint8Array(positions.buffer), off); off += posBytes;
  binArray.set(new Uint8Array(indices.buffer), off); off += idxBytes;
  binArray.set(new Uint8Array(joints.buffer), off); off += jointsBytes;
  binArray.set(new Uint8Array(weights.buffer), off); off += weightsBytes;
  binArray.set(new Uint8Array(animTimes.buffer), off); off += timesBytes;
  binArray.set(new Uint8Array(animValues.buffer), off);

  off = 0;
  const bv = (byteOffset: number, byteLength: number) => ({ buffer: 0, byteOffset, byteLength });

  const json = {
    asset: { version: '2.0' },
    scene: 0,
    scenes: [{ nodes: [0, 1, 2] }],
    nodes: [
      { name: 'SkinnedMesh', mesh: 0, skin: 0 },
      { name: 'Root', children: [2], translation: [0, 0, 0] as [number, number, number] },
      { name: 'Bone1', translation: [0, 0.5, 0] as [number, number, number] },
    ],
    meshes: [{
      name: 'Quad',
      primitives: [{
        attributes: {
          POSITION: 0,
          JOINTS_0: 2,
          WEIGHTS_0: 3,
        },
        indices: 1,
      }],
    }],
    accessors: [
      { bufferView: 0, componentType: 5126, count: 4, type: 'VEC3' }, // positions
      { bufferView: 1, componentType: 5123, count: 6, type: 'SCALAR' }, // indices
      { bufferView: 2, componentType: 5121, count: 4, type: 'VEC4' }, // joints (UNSIGNED_BYTE)
      { bufferView: 3, componentType: 5126, count: 4, type: 'VEC4' }, // weights
      { bufferView: 4, componentType: 5126, count: 2, type: 'SCALAR' }, // anim times
      { bufferView: 5, componentType: 5126, count: 2, type: 'VEC4' }, // anim rotation values
    ],
    bufferViews: [
      bv(0, posBytes),
      bv(posBytes, idxBytes),
      bv(posBytes + idxBytes, jointsBytes),
      bv(posBytes + idxBytes + jointsBytes, weightsBytes),
      bv(posBytes + idxBytes + jointsBytes + weightsBytes, timesBytes),
      bv(posBytes + idxBytes + jointsBytes + weightsBytes + timesBytes, valuesBytes),
    ],
    buffers: [{ byteLength: totalBin }],
    skins: [{
      name: 'Armature',
      joints: [1, 2],
      skeleton: 1,
    }],
    animations: [{
      name: 'BendAnimation',
      channels: [
        { sampler: 0, target: { node: 2, path: 'rotation' } },
      ],
      samplers: [
        { input: 4, output: 5, interpolation: 'LINEAR' },
      ],
    }],
  };

  return buildGlbBuffer(json, binArray);
}

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe('parseGlb', () => {
  beforeEach(() => resetFbxIdCounter());

  it('rejects buffers that are too small', () => {
    expect(() => parseGlb(Buffer.alloc(8))).toThrow('too small');
  });

  it('rejects invalid magic number', () => {
    const buf = Buffer.alloc(12);
    buf.writeUInt32LE(0xDEADBEEF, 0);
    buf.writeUInt32LE(2, 4);
    buf.writeUInt32LE(12, 8);
    expect(() => parseGlb(buf)).toThrow('Invalid GLB magic');
  });

  it('rejects unsupported GLB version', () => {
    const buf = Buffer.alloc(12);
    buf.writeUInt32LE(0x46546C67, 0); // glTF
    buf.writeUInt32LE(1, 4);          // version 1
    buf.writeUInt32LE(12, 8);
    expect(() => parseGlb(buf)).toThrow('Unsupported GLB version');
  });

  it('rejects GLB without JSON chunk', () => {
    // Valid header but BIN chunk instead of JSON
    const buf = Buffer.alloc(20);
    buf.writeUInt32LE(0x46546C67, 0);
    buf.writeUInt32LE(2, 4);
    buf.writeUInt32LE(20, 8);
    buf.writeUInt32LE(0, 12);         // chunk length = 0
    buf.writeUInt32LE(0x004E4942, 16); // BIN type
    expect(() => parseGlb(buf)).toThrow('missing JSON chunk');
  });

  it('parses a minimal GLB with only JSON chunk', () => {
    const glb = buildGlbBuffer({ asset: { version: '2.0' } });
    const { json, bin } = parseGlb(glb);
    expect(json.asset?.version).toBe('2.0');
    expect(bin).toBeNull();
  });

  it('parses GLB with JSON and BIN chunks', () => {
    const data = new Float32Array([1.0, 2.0, 3.0]);
    const glb = buildGlbBuffer(
      { asset: { version: '2.0' }, buffers: [{ byteLength: data.byteLength }] },
      data,
    );
    const { json, bin } = parseGlb(glb);
    expect(json.buffers?.[0].byteLength).toBe(data.byteLength);
    expect(bin).not.toBeNull();
    expect(bin!.length).toBeGreaterThanOrEqual(data.byteLength);
  });
});

describe('convertGlbToFbx', () => {
  beforeEach(() => resetFbxIdCounter());

  it('converts a triangle mesh GLB to FBX ASCII', () => {
    const glb = makeTriangleGlb();
    const result = convertGlbToFbx(glb);

    expect(result.meshCount).toBe(1);
    expect(result.jointCount).toBe(0);
    expect(result.animationCount).toBe(0);

    // Verify FBX structure
    expect(result.fbxContent).toContain('FBXHeaderExtension');
    expect(result.fbxContent).toContain('FBXVersion: 7500');
    expect(result.fbxContent).toContain('GlobalSettings');
    expect(result.fbxContent).toContain('Objects:');
    expect(result.fbxContent).toContain('Connections:');
    expect(result.fbxContent).toContain('Geometry::Triangle');
    expect(result.fbxContent).toContain('Model::Triangle');
    expect(result.fbxContent).toContain('Vertices:');
    expect(result.fbxContent).toContain('PolygonVertexIndex:');
    expect(result.fbxContent).toContain('LayerElementNormal');
    expect(result.fbxContent).toContain('LayerElementUV');
  });

  it('applies scale factor to positions', () => {
    const glb = makeTriangleGlb();
    const result = convertGlbToFbx(glb, { scaleFactor: 100 });

    // The original positions include 1.0, so scaled should be 100.0
    expect(result.fbxContent).toContain('100');
    expect(result.meshCount).toBe(1);
  });

  it('converts a skinned animated GLB', () => {
    const glb = makeSkinnedAnimatedGlb();
    const result = convertGlbToFbx(glb);

    expect(result.meshCount).toBe(1);
    expect(result.jointCount).toBe(2);
    expect(result.animationCount).toBe(1);

    // Check skeleton
    expect(result.fbxContent).toContain('Model::Root');
    expect(result.fbxContent).toContain('Model::Bone1');
    expect(result.fbxContent).toContain('LimbNode');
    expect(result.fbxContent).toContain('TypeFlags: "Skeleton"');

    // Check skin deformer
    expect(result.fbxContent).toContain('Deformer::Skin');

    // Check animation
    expect(result.fbxContent).toContain('AnimStack::BendAnimation');
    expect(result.fbxContent).toContain('AnimLayer::BaseLayer');
    expect(result.fbxContent).toContain('AnimationCurve:');
  });

  it('excludes animations when includeAnimations=false', () => {
    const glb = makeSkinnedAnimatedGlb();
    const result = convertGlbToFbx(glb, { includeAnimations: false });

    expect(result.meshCount).toBe(1);
    expect(result.jointCount).toBe(2);
    expect(result.animationCount).toBe(0);
    expect(result.fbxContent).not.toContain('AnimStack');
  });

  it('excludes skeleton when includeSkeleton=false', () => {
    const glb = makeSkinnedAnimatedGlb();
    const result = convertGlbToFbx(glb, { includeSkeleton: false });

    expect(result.meshCount).toBe(1);
    expect(result.jointCount).toBe(0);
    expect(result.animationCount).toBe(0);
    expect(result.fbxContent).not.toContain('LimbNode');
  });

  it('handles GLB with no meshes', () => {
    const glb = buildGlbBuffer({
      asset: { version: '2.0' },
      scene: 0,
      scenes: [{ nodes: [] }],
      nodes: [],
    });
    const result = convertGlbToFbx(glb);

    expect(result.meshCount).toBe(0);
    expect(result.jointCount).toBe(0);
    expect(result.animationCount).toBe(0);
    expect(result.fbxContent).toContain('FBXVersion: 7500');
  });

  it('generates valid FBX polygon indices with negated last index', () => {
    const glb = makeTriangleGlb();
    const result = convertGlbToFbx(glb);

    // FBX format: last index of each polygon is negated and decremented
    // Triangle (0,1,2) → (0, 1, -3)
    expect(result.fbxContent).toContain('0,1,-3');
  });

  it('produces correct UnitScaleFactor in global settings', () => {
    const glb = makeTriangleGlb();
    const result = convertGlbToFbx(glb);
    expect(result.fbxContent).toContain('"UnitScaleFactor"');
    expect(result.fbxContent).toContain('1.0');
  });
});

describe('convertGlbBufferToFbx', () => {
  beforeEach(() => resetFbxIdCounter());

  it('returns a Buffer and stats', () => {
    const glb = makeTriangleGlb();
    const { fbxBuffer, stats } = convertGlbBufferToFbx(glb);

    expect(Buffer.isBuffer(fbxBuffer)).toBe(true);
    expect(fbxBuffer.length).toBeGreaterThan(0);
    expect(stats.meshCount).toBe(1);
    expect(stats.jointCount).toBe(0);
    expect(stats.animationCount).toBe(0);
  });

  it('buffer content matches string conversion', () => {
    const glb = makeTriangleGlb();
    resetFbxIdCounter();
    const stringResult = convertGlbToFbx(glb);
    resetFbxIdCounter();
    const { fbxBuffer } = convertGlbBufferToFbx(glb);

    expect(fbxBuffer.toString('utf-8')).toBe(stringResult.fbxContent);
  });
});
