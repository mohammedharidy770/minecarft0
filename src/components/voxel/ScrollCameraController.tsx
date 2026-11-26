import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export interface CameraKeyframe {
  at: number; // 0..1 normalized scroll progress
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
}

const _pos = new THREE.Vector3();
const _target = new THREE.Vector3();
const _currentLook = new THREE.Vector3();

function sampleKeyframes(keyframes: CameraKeyframe[], p: number) {
  const clamped = Math.max(0, Math.min(1, p));
  if (keyframes.length === 0) {
    return { pos: [0, 5, 10], target: [0, 0, 0], fov: 45 };
  }
  if (clamped <= keyframes[0].at) {
    return {
      pos: keyframes[0].position,
      target: keyframes[0].target,
      fov: keyframes[0].fov ?? 45,
    };
  }
  for (let i = 0; i < keyframes.length - 1; i++) {
    const a = keyframes[i];
    const b = keyframes[i + 1];
    if (clamped >= a.at && clamped <= b.at) {
      const span = Math.max(0.0001, b.at - a.at);
      const raw = (clamped - a.at) / span;
      const t = raw * raw * (3 - 2 * raw); // smoothstep easing
      return {
        pos: [
          THREE.MathUtils.lerp(a.position[0], b.position[0], t),
          THREE.MathUtils.lerp(a.position[1], b.position[1], t),
          THREE.MathUtils.lerp(a.position[2], b.position[2], t),
        ] as [number, number, number],
        target: [
          THREE.MathUtils.lerp(a.target[0], b.target[0], t),
          THREE.MathUtils.lerp(a.target[1], b.target[1], t),
          THREE.MathUtils.lerp(a.target[2], b.target[2], t),
        ] as [number, number, number],
        fov: THREE.MathUtils.lerp(a.fov ?? 45, b.fov ?? 45, t),
      };
    }
  }
  const last = keyframes[keyframes.length - 1];
  return { pos: last.position, target: last.target, fov: last.fov ?? 45 };
}

interface ScrollCameraControllerProps {
  keyframes: CameraKeyframe[];
  progressRef: React.MutableRefObject<number>;
  damping?: number;
}

export function ScrollCameraController({
  keyframes,
  progressRef,
  damping = 6,
}: ScrollCameraControllerProps) {
  const { camera } = useThree();
  const initialized = useRef(false);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const sample = sampleKeyframes(keyframes, progressRef.current);
    _pos.set(sample.pos[0], sample.pos[1], sample.pos[2]);
    _target.set(sample.target[0], sample.target[1], sample.target[2]);

    if (!initialized.current) {
      camera.position.copy(_pos);
      _currentLook.copy(_target);
      camera.lookAt(_currentLook);
      initialized.current = true;
      return;
    }

    camera.position.x = THREE.MathUtils.damp(camera.position.x, _pos.x, damping, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, _pos.y, damping, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, _pos.z, damping, dt);

    _currentLook.x = THREE.MathUtils.damp(_currentLook.x, _target.x, damping, dt);
    _currentLook.y = THREE.MathUtils.damp(_currentLook.y, _target.y, damping, dt);
    _currentLook.z = THREE.MathUtils.damp(_currentLook.z, _target.z, damping, dt);

    camera.lookAt(_currentLook);

    if (camera instanceof THREE.PerspectiveCamera && Math.abs(camera.fov - sample.fov) > 0.05) {
      camera.fov = THREE.MathUtils.damp(camera.fov, sample.fov, damping, dt);
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
