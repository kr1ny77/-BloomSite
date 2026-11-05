import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Euler, Quaternion, Vector3, OrthographicCamera } from 'three';
import { createOrientationController } from '../scripts/product-orientation.js';
const camera = new OrthographicCamera();
camera.position.set(0, 1.65, 4.4);
camera.lookAt(0, 0, 0);
const inverseView = camera.quaternion.clone().invert();
for (const [name, initial] of [
  ['front', new Quaternion()],
  ['side', new Quaternion().setFromEuler(new Euler(0, Math.PI / 2, 0))],
  [
    'reverse side',
    new Quaternion().setFromEuler(new Euler(0, -Math.PI / 2, 0)),
  ],
  ['upside down', new Quaternion().setFromEuler(new Euler(Math.PI, 1.2, 0.3))],
  ['tilted underside', new Quaternion().setFromEuler(new Euler(1.4, 2, -0.7))],
]) {
  test(`screen-relative drag stays right/down from ${name}`, () => {
    for (const [dx, dy] of [
      [0.1, 0],
      [0, 0.1],
      [-0.1, 0],
      [0, -0.1],
    ]) {
      const orientation = initial.clone();
      // The material point currently facing the camera, irrespective of label pose.
      const localVisiblePoint = new Vector3(0, 0, 1)
        .applyQuaternion(camera.quaternion)
        .applyQuaternion(orientation.clone().invert());
      const control = createOrientationController(
        orientation,
        camera.quaternion,
      );
      control.rotate(dx, dy);
      const projected = localVisiblePoint
        .applyQuaternion(orientation)
        .applyQuaternion(inverseView);
      if (dx) assert.ok(projected.x * dx > 0, 'horizontal follows cursor');
      if (dy) assert.ok(projected.y * dy < 0, 'positive screen y is down');
      assert.ok(Math.abs(orientation.length() - 1) < 1e-12);
    }
  });
}
test('full turns and mixed gestures preserve rotation; reset is deterministic', () => {
  const base = new Quaternion().setFromEuler(new Euler(-0.07, 0, -0.11));
  const orientation = base.clone();
  const control = createOrientationController(orientation, camera.quaternion);
  for (let i = 1; i <= 360; i++) control.rotate((i * Math.PI) / 180, 0);
  assert.ok(orientation.angleTo(base) < 1e-6);
  for (let i = 1; i <= 1000; i++)
    control.rotate(2 * Math.PI + i * 0.007, i * 0.005);
  assert.ok(Math.abs(orientation.length() - 1) < 1e-12);
  control.reset();
  assert.ok(orientation.angleTo(base) < 1e-6);
  control.reset(Math.PI);
  const expected = base
    .clone()
    .multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI));
  assert.ok(orientation.angleTo(expected) < 1e-6);
  control.rotate(Math.PI, 0);
  assert.ok(orientation.angleTo(expected) < 1e-6);
});

test('return takes the shortest smooth path home, exact finish and interruption remain stable', () => {
  const base = new Quaternion().setFromEuler(new Euler(-0.07, 0, -0.11));
  const orientation = base.clone();
  const control = createOrientationController(orientation, camera.quaternion);
  control.rotate(1.7, 2.2);
  const start = orientation.clone();
  const distance = start.angleTo(base);
  control.beginReturn();
  control.returnHome(0.5);
  assert.ok(Math.abs(orientation.angleTo(base) - distance / 2) < 1e-6);
  const partial = orientation.clone();
  control.rotate(1.7, 2.2);
  assert.ok(orientation.angleTo(partial) < 1e-6);
  control.rotate(1.75, 2.2);
  assert.ok(orientation.angleTo(partial) > 0.04);
  control.beginReturn();
  control.returnHome(1);
  assert.ok(orientation.angleTo(base) < 1e-6);
  control.rotate(0, 0);
  assert.ok(orientation.angleTo(base) < 1e-6);
});
