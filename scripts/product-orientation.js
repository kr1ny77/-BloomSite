import { Quaternion, Vector3 } from 'three';

// Apply gestures in the camera plane, never in the model's already-turned axes.
export function createOrientationController(orientation, cameraQuaternion) {
  const base = orientation.clone();
  const axis = new Vector3();
  const delta = new Quaternion();
  const returnFrom = new Quaternion();
  const localY = new Vector3(0, 1, 0);
  const localX = new Vector3(1, 0, 0);
  let previousYaw = 0,
    previousPitch = 0;
  return {
    rotate(yaw, pitch = 0) {
      const dx = yaw - previousYaw,
        dy = pitch - previousPitch;
      previousYaw = yaw;
      previousPitch = pitch;
      const angle = Math.hypot(dx, dy);
      if (!angle) return;
      // Positive horizontal moves the visible surface right; positive vertical down.
      axis.set(dy, dx, 0).normalize().applyQuaternion(cameraQuaternion);
      delta.setFromAxisAngle(axis, angle);
      orientation.premultiply(delta).normalize();
    },
    beginReturn() {
      returnFrom.copy(orientation);
    },
    returnHome(progress) {
      orientation
        .slerpQuaternions(returnFrom, base, Math.max(0, Math.min(1, progress)))
        .normalize();
      if (progress >= 1) previousYaw = previousPitch = 0;
    },
    reset(yaw = 0, pitch = 0) {
      previousYaw = yaw;
      previousPitch = pitch;
      orientation
        .copy(base)
        .multiply(delta.setFromAxisAngle(localY, yaw))
        .multiply(delta.setFromAxisAngle(localX, pitch))
        .normalize();
    },
  };
}
