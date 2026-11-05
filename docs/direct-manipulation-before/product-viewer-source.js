import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Requested near the package; there is no perpetual renderer loop.
export async function mount(host) {
  let renderer, scene, environment, pmrem, room, observer, canvas, light;
  let disposed = false;
  const onContextLoss = (event) => {
    event.preventDefault();
    host.dispatchEvent(new CustomEvent('bloom:viewererror'));
  };
  // The same cleanup owns partial initialization, context loss and normal exit.
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    observer?.disconnect();
    canvas?.removeEventListener('webglcontextlost', onContextLoss);
    const resources = new Set();
    scene?.traverse((object) => {
      if (object.geometry) resources.add(object.geometry);
      for (const material of [].concat(object.material ?? [])) {
        for (const value of Object.values(material))
          if (value?.isTexture) resources.add(value);
        resources.add(material);
      }
    });
    resources.forEach((resource) => resource.dispose());
    room?.dispose();
    pmrem?.dispose();
    environment?.dispose();
    light?.shadow.map?.dispose();
    renderer?.dispose();
    canvas?.remove();
  };
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.setClearColor(0x000000, 0);
    scene = new THREE.Scene();
    pmrem = new THREE.PMREMGenerator(renderer);
    room = new RoomEnvironment();
    environment = pmrem.fromScene(room, 0.04);
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.7;
    room.dispose();
    room = null;
    pmrem.dispose();
    pmrem = null;
    scene.add(new THREE.HemisphereLight(0xf3f7ed, 0x52624b, 0.8));
    light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(-1, 6, 2);
    light.castShadow = true;
    light.shadow.mapSize.set(512, 512);
    Object.assign(light.shadow.camera, {
      left: -1.5,
      right: 1.5,
      top: 1.5,
      bottom: -1.5,
      near: 0.1,
      far: 15,
    });
    light.shadow.normalBias = 0.015;
    light.shadow.radius = 5;
    scene.add(light);
    const camera = new THREE.OrthographicCamera(-1, 1, 0.68, -0.68, 0.1, 30);
    camera.position.set(0, 1.65, 4.4);
    camera.lookAt(0, 0, 0);
    const model = (
      await new GLTFLoader().loadAsync('/static/models/yogurt.glb')
    ).scene;
    const pivot = new THREE.Group();
    model.position.y = -0.42;
    model.traverse((object) => {
      if (object.isMesh) object.castShadow = true;
    });
    pivot.add(model);
    scene.add(pivot);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 3),
      new THREE.ShadowMaterial({ opacity: 0.08 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.4;
    ground.receiveShadow = true;
    scene.add(ground);
    canvas = renderer.domElement;
    canvas.setAttribute('aria-hidden', 'true');
    host.append(canvas);
    const render = () => renderer.render(scene, camera);
    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      camera.left = (-0.68 * width) / height;
      camera.right = (0.68 * width) / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      render();
    };
    observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    canvas.addEventListener('webglcontextlost', onContextLoss);
    return {
      rotate(angle) {
        pivot.rotation.y = angle;
        render();
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
