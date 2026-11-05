import { Vector3, Triangle } from 'three';

// These bounds come from the authored 2048×512 wrap, including its quiet zone.
export const barcodeUV = {
  left: 1296 / 2048,
  right: 1776 / 2048,
  top: 199 / 512,
  bottom: 412 / 512,
};
export const isBarcodeUV = (uv) =>
  Boolean(
    uv &&
    uv.x >= barcodeUV.left &&
    uv.x <= barcodeUV.right &&
    uv.y >= barcodeUV.top &&
    uv.y <= barcodeUV.bottom,
  );

// Resolve the printed location from the mesh UVs, preserving export transforms.
export function barcodeAnchor(geometry) {
  const uv = geometry.getAttribute('uv');
  const positions = geometry.getAttribute('position');
  if (!uv || !positions) return null;
  const target = new Vector3(0.75, 285 / 512, 0);
  const corners = [new Vector3(), new Vector3(), new Vector3()];
  const weights = new Vector3();
  const count = geometry.index?.count ?? positions.count;
  for (let i = 0; i < count; i += 3) {
    const indices = [0, 1, 2].map((j) => geometry.index?.getX(i + j) ?? i + j);
    indices.forEach((index, j) =>
      corners[j].set(uv.getX(index), uv.getY(index), 0),
    );
    if (
      !Triangle.getBarycoord(target, ...corners, weights) ||
      Math.min(weights.x, weights.y, weights.z) < -1e-6
    )
      continue;
    indices.forEach((index, j) =>
      corners[j].fromBufferAttribute(positions, index),
    );
    const point = new Vector3()
      .addScaledVector(corners[0], weights.x)
      .addScaledVector(corners[1], weights.y)
      .addScaledVector(corners[2], weights.z);
    const normal = Triangle.getNormal(...corners, new Vector3());
    return { point, normal };
  }
  return null;
}
