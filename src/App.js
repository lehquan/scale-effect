import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

class App {
  constructor() {
    this.WIDTH = window.innerWidth/1.5
    this.HEIGHT = window.innerHeight/1.5
  }

  init = () => {
    const container = document.createElement("div");
    container.classList.add('container')
    document.body.appendChild(container);

    // camera
    this.camera = new THREE.PerspectiveCamera(
        45,
        this.WIDTH / this.HEIGHT,
        0.1,
        1e27
    );
    this.camera.position.set(0, 3, 10)

    // renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.renderer.setClearColor(0xaaaaaa, 0); // Alpha color setting.
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.WIDTH, this.HEIGHT);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.LinearToneMapping
    this.renderer.toneMappingExposure = 1
    container.appendChild(this.renderer.domElement);

    // scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xd0d0d0)
    // this.scene.fog = new THREE.Fog('#d0d0d0', 100, 600)

    // Fixed cube
    const cubeGeometry = new THREE.BoxGeometry( 1, 1, 1);
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 1 });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.scale.set(1, 1, 1)
    cube.castShadow = true;
    cube.position.set(0, 0, 0)
    // this.scene.add(cube);

    // load model
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('vendor/draco/gltf/')
    dracoLoader.preload()

    const loader = new GLTFLoader()
    loader.setDRACOLoader(dracoLoader)
    loader.load('assets/helmet.glb', gltf => {

      // for shadow
      gltf.scene.traverse(child => {
        child.isMesh && (child.receiveShadow = child.castShadow = true);
        if (child.material) {
          child.material.side = THREE.DoubleSide
          child.material.depthTest = true
          child.material.depthWrite = true
          child.material.needsUpdate = true
        }
      })

      const bounds = new THREE.Box3().setFromObject( gltf.scene );
      const center = new THREE.Vector3();
      const sz = new THREE.Vector3();
      bounds.getSize(sz);
      bounds.getCenter( center );
      gltf.scene.position.sub( center ); // center the model
      this.scene.add( gltf.scene );
      this.fitCameraToObject(gltf.scene)
    })

    // lights
    const ambientLight = new THREE.AmbientLight(0x999999)
    const dir1 = new THREE.DirectionalLight(0xffffff, 1)
    dir1.position.set(1.5, 1.2, 0)
    dir1.castShadow = true
    this.scene.add(ambientLight, dir1)
    // const cameraHelper = new THREE.CameraHelper(dir1.shadow.camera);
    // this.scene.add(cameraHelper);

    // ground
    const planeGeometry = new THREE.PlaneGeometry(1, 1);
    const planeMaterial = new THREE.MeshLambertMaterial({color: 0xcccccc});
    const ground = new THREE.Mesh(planeGeometry, planeMaterial);
    ground.receiveShadow = true;
    ground.rotation.x = -0.5*Math.PI; // -90º
    ground.scale.setScalar(50)
    ground.position.set(0, -1.5, 0)
    this.scene.add(ground);

    // controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // controls.addEventListener("change", this.#render);
    // controls.minDistance = 0.02;
    // controls.maxDistance = 10;
    this.controls.target.set(0, 0, -0.2);
    this.controls.update();

    window.addEventListener("resize", this.#onWindowResize);
    this.#animate()
  };

  fitCameraToObject( object ) {

    const offset = 1.5
    const boundingBox = new THREE.Box3();
    boundingBox.setFromObject(object);

    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());

    const startDistance = center.distanceTo(this.camera.position);
    // here we must check if the screen is horizontal or vertical, because camera.fov is
    // based on the vertical direction.
    const endDistance = this.camera.aspect > 1 ?
        ((size.y / 2) + offset) / Math.abs(Math.tan(this.camera.fov / 2)) :
        ((size.y / 2) + offset) / Math.abs(Math.tan(this.camera.fov / 2)) /
        this.camera.aspect;

    this.camera.position.set(
        this.camera.position.x * endDistance / startDistance,
        this.camera.position.y * endDistance / startDistance,
        this.camera.position.z * endDistance / startDistance,
    );
    this.camera.lookAt(center);
  }

  #updateCenter = ( mesh ) => {
    let bounds = new THREE.Box3();
    mesh.updateMatrixWorld(true);
    bounds.setFromObject(mesh)
    let sz = new THREE.Vector3();
    let center = new THREE.Vector3();
    bounds.getSize(sz);
    bounds.getCenter(center);

    let smax = Math.max(sz.x, Math.max(sz.y, sz.z));
    if(smax < 100 ) {
      mesh.scale.multiplyScalar(2 / smax);
    } else {
      console.warn("Model is very large. Scale to 2 meters?")
    }
    // if ((smax < 100) || console.warn("Model is very large. Scale to 2 meters?")) {
    //   mesh.scale.multiplyScalar(2 / smax);
    // }
  }

  #onWindowResize = () => {
    this.camera.aspect = this.WIDTH /this.HEIGHT;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.WIDTH, this.HEIGHT);
  };

  #animate = () => {
    requestAnimationFrame(this.#animate)
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

export { App }
