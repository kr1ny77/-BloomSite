import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { BufferAttribute, BufferGeometry } from 'three';
import { barcodeAnchor, isBarcodeUV } from '../scripts/product-barcode.js';

// Read the actual shipped mesh, including its exported UV convention.
const bytes = readFileSync(
  new URL('../static/models/yogurt.glb', import.meta.url),
);
const jsonLength = bytes.readUInt32LE(12);
const gltf = JSON.parse(bytes.subarray(20, 20 + jsonLength));
const binary = bytes.subarray(28 + jsonLength);
const primitive = gltf.meshes.find((mesh) => mesh.name === 'Printed wrap')
  .primitives[0];
const geometry = new BufferGeometry();
function attribute(index) {
  const a = gltf.accessors[index],
    view = gltf.bufferViews[a.bufferView];
  const count = { SCALAR: 1, VEC2: 2, VEC3: 3 }[a.type];
  const size = { 5123: 2, 5125: 4, 5126: 4 }[a.componentType];
  const result = new Float32Array(a.count * count);
  for (let i = 0; i < a.count; i++)
    for (let j = 0; j < count; j++) {
      const offset =
        (view.byteOffset ?? 0) +
        (a.byteOffset ?? 0) +
        i * (view.byteStride ?? count * size) +
        j * size;
      result[i * count + j] =
        a.componentType === 5126
          ? binary.readFloatLE(offset)
          : a.componentType === 5123
            ? binary.readUInt16LE(offset)
            : binary.readUInt32LE(offset);
    }
  return new BufferAttribute(result, count);
}
geometry.setAttribute('position', attribute(primitive.attributes.POSITION));
geometry.setAttribute('uv', attribute(primitive.attributes.TEXCOORD_0));
geometry.setIndex(Array.from(attribute(primitive.indices).array));

test('barcode maps to its real printed panel, separate from ingredients and opposite the front artwork', () => {
  const anchor = barcodeAnchor(geometry);
  assert.ok(anchor);
  assert.ok(anchor.point.y > 0.2 && anchor.point.y < 0.5);
  assert.ok(Math.abs(anchor.point.x) < 0.02);
  assert.ok(anchor.point.z < -0.3, 'barcode sits on the rear surface');
  assert.ok(anchor.normal.z < -0.9);
  assert.equal(isBarcodeUV({ x: 0.75, y: 285 / 512 }), true);
  assert.equal(
    isBarcodeUV({ x: 0.25, y: 0.5 }),
    false,
    'front artwork is not interactive',
  );
  assert.equal(
    isBarcodeUV({ x: 1040 / 2048, y: 0.5 }),
    false,
    'ingredients are not the barcode',
  );
  assert.equal(
    isBarcodeUV({ x: 0.75, y: 0.1 }),
    false,
    'nutrition heading is not the barcode',
  );
  assert.equal(isBarcodeUV(null), false);
});
