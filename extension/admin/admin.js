import * as THREE from "../libs/three.module.js";
import { OrbitControls } from "../libs/OrbitControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050b1a);

const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(3, 2.5, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth - 300, window.innerHeight);
document.getElementById("viewer").appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// simple stage
const stage = new THREE.Mesh(
    new THREE.BoxGeometry(5, 0.2, 3.5),
    new THREE.MeshBasicMaterial({ color: 0xdd8866 })
);
stage.position.set(0, -0.1, 2);
scene.add(stage);

// light
const light = new THREE.AmbientLight(0xffffff);
scene.add(light);

// animate
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();




const saveBtn = document.getElementById("saveBtn");
const output = document.getElementById("output");

let db = {};


saveBtn.onclick = () => {
    const venue = document.getElementById("venue").value;
    const section = document.getElementById("section").value;
    const row = document.getElementById("row").value;

    if (!db[venue]) db[venue] = {};
    if (!db[venue][section]) db[venue][section] = {};

    db[venue][section][row] = {
        pos: [
            camera.position.x,
            camera.position.y,
            camera.position.z
        ],
        target: [
            controls.target.x,
            controls.target.y,
            controls.target.z
        ]
    };

    output.textContent = JSON.stringify(db, null, 2);
};