/**
 * DebugLabelUtils - Creates floating text labels above procedural fallback meshes
 * for visual debugging of asset loading. Labels only appear when a procedural
 * fallback is used instead of a proper asset model.
 */

import {
  AbstractMesh,
  DynamicTexture,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';

const DEBUG_LABELS_ENABLED = true;

/**
 * Create a floating billboard text label above a mesh.
 * The label uses a DynamicTexture on a plane with billboard mode
 * so it always faces the camera.
 *
 * @param scene - BabylonJS scene
 * @param parentMesh - The mesh to attach the label above
 * @param text - Label text to display
 * @param yOffset - How far above the mesh to place the label (default: auto from bounding box)
 * @returns The label plane mesh, or null if labels are disabled
 */
export function createDebugLabel(
  scene: Scene,
  parentMesh: AbstractMesh,
  text: string,
  yOffset?: number
): Mesh | null {
  if (!DEBUG_LABELS_ENABLED) return null;

  // Calculate height above mesh
  const bounds = parentMesh.getBoundingInfo();
  const meshHeight = bounds ? (bounds.boundingBox.maximumWorld.y - bounds.boundingBox.minimumWorld.y) : 2;
  const labelY = yOffset ?? (meshHeight + 1.5);

  // Create dynamic texture for text rendering
  const textureWidth = 512;
  const textureHeight = 128;
  const texture = new DynamicTexture(
    `debug_label_tex_${parentMesh.name}`,
    { width: textureWidth, height: textureHeight },
    scene,
    false
  );

  // Draw text on texture using raw canvas context
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ctx = texture.getContext() as any as CanvasRenderingContext2D;
  ctx.clearRect(0, 0, textureWidth, textureHeight);

  // Background with slight transparency
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  const radius = 12;
  roundRect(ctx, 4, 4, textureWidth - 8, textureHeight - 8, radius);
  ctx.fill();

  // Border
  ctx.strokeStyle = '#ffcc00';
  ctx.lineWidth = 3;
  roundRect(ctx, 4, 4, textureWidth - 8, textureHeight - 8, radius);
  ctx.stroke();

  // Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Word wrap if needed
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > textureWidth - 40) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  const lineHeight = 36;
  const startY = (textureHeight - lines.length * lineHeight) / 2 + lineHeight / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, textureWidth / 2, startY + i * lineHeight);
  });

  texture.update();
  texture.hasAlpha = true;

  // Create billboard plane
  const planeWidth = 3;
  const planeHeight = planeWidth * (textureHeight / textureWidth);
  const plane = MeshBuilder.CreatePlane(
    `debug_label_${parentMesh.name}`,
    { width: planeWidth, height: planeHeight },
    scene
  );

  const mat = new StandardMaterial(`debug_label_mat_${parentMesh.name}`, scene);
  mat.diffuseTexture = texture;
  mat.emissiveTexture = texture;
  mat.disableLighting = true;
  mat.backFaceCulling = false;
  mat.useAlphaFromDiffuseTexture = true;
  plane.material = mat;

  // Position above the parent mesh
  plane.position = new Vector3(0, labelY, 0);
  plane.parent = parentMesh;

  // Billboard mode — always face camera
  plane.billboardMode = Mesh.BILLBOARDMODE_ALL;

  plane.isPickable = false;
  plane.checkCollisions = false;

  return plane;
}

/**
 * Helper to draw a rounded rectangle on a canvas context
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
