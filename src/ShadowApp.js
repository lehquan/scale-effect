import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

class ShadowApp {
  constructor() {
  }

  init = () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    // camera
    this.camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    this.camera.position.x = -30;
    this.camera.position.y = 40;
    this.camera.position.z = 30;

    // renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.renderer.setClearColor(0xaaaaaa, 0); // Alpha color setting.
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000)

    var planeGeometry = new THREE.PlaneGeometry(60, 20);
    var planeMaterial = new THREE.MeshLambertMaterial({color: 0xcccccc});

    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true;
    plane.rotation.x = -0.5*Math.PI; // -90º
    plane.position.x = 15;
    plane.position.y = 0;
    plane.position.z = 0;
    this.scene.add(plane);

    var sphereGeometry = new THREE.SphereGeometry (4, 20, 20);
    var sphereMaterial = new THREE.MeshLambertMaterial({color: 0x7777ff});
    var sphere = new THREE.Mesh (sphereGeometry, sphereMaterial);
    sphere.castShadow = true;
    sphere.position.x = 20;
    sphere.position.y = 4;
    sphere.position.z = 2;
    this.scene.add(sphere);

    var cubeGeometry = new THREE.BoxGeometry( 4, 4, 4);
    var cubeMaterial = new THREE.MeshStandardMaterial({color: 0xff0000});
    var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.castShadow = true;
    cube.position.set(-4, 3, 0)
    cube.add(new THREE.AxesHelper(10))
    this.scene.add(cube);

    /*var spotLight = new THREE.SpotLight(0xffffff, 0.8);
    spotLight.position.set(-40, 60, -10);
    spotLight.castShadow = true;
    spotLight.angle = Math.PI / 8.0;
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    this.scene.add(spotLight);*/
    const dir1 = new THREE.DirectionalLight(0xffffff, 1)
    dir1.position.set(1, 1.2, 0)
    dir1.castShadow = true
    this.scene.add(dir1)

    // controls
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    // controls.addEventListener("change", this.#render);
    // controls.minDistance = 0.02;
    // controls.maxDistance = 10;
    controls.target.set(0, 0, -0.2);
    controls.update();

    console.warn(this.scene.children)

    //
    window.addEventListener("resize", this.#onWindowResize);
    this.#animate()
  };

  #onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  #animate = () => {
    console.log('aaa')
    requestAnimationFrame(this.#animate)
    this.renderer.render(this.scene, this.camera);
  }
}

export { ShadowApp }
