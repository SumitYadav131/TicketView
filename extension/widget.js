import * as THREE from "./libs/three.module.js";

import { OrbitControls } from "./libs/OrbitControls.js";
// --- Setup Scene ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050b1a);
scene.fog = new THREE.FogExp2(0x050b1a, 0.008);

// --- Camera ---
const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
);

camera.position.set(3, 2.5, 6);

// --- Renderer ---
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement);

// --- Controls ---
const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 1.0;
controls.zoomSpeed = 1.0;
controls.enableZoom = true;

controls.target.set(0, 2, 0);

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0x404060);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xfff5e0, 1.2);

mainLight.position.set(5, 10, 7);
mainLight.castShadow = true;
mainLight.receiveShadow = true;

scene.add(mainLight);

const fillLight = new THREE.PointLight(0xffaa66, 0.5);

fillLight.position.set(0, 1, 0);

scene.add(fillLight);

const rimLight = new THREE.PointLight(0xff66cc, 0.4);

rimLight.position.set(-3, 4, -5);

scene.add(rimLight);

const spotLight = new THREE.PointLight(0xff4400, 0.6);

spotLight.position.set(2, 1.5, 3);

scene.add(spotLight);

// --- Stage ---
const stageBase = new THREE.BoxGeometry(5, 0.2, 3.5);

const stageMat = new THREE.MeshStandardMaterial({
    color: 0xdd8866,
    roughness: 0.3,
    metalness: 0.6,
});

const stage = new THREE.Mesh(stageBase, stageMat);

stage.position.set(0, -0.1, 2);

stage.castShadow = true;
stage.receiveShadow = true;

scene.add(stage);

// --- Seat View Presets ---
const seatViews = {
    110: { pos: [-2.0, 2.2, 5.2], target: [0, 1.8, 1.2] },
    114: { pos: [2.2, 2.0, 5.0], target: [0.2, 1.8, 1.5] },
    334: { pos: [-3.5, 3.8, 8.5], target: [0, 2.0, 1.0] },
    120: { pos: [4.0, 1.8, 4.2], target: [-0.3, 1.8, 1.3] },
};

// Function to update camera to seat view
function setSeatView(section, row) {

    const badge = document.getElementById("seatBadge");

    if (badge) {
        badge.innerHTML =
            `📍 Section ${section} | Row ${row || "?"}`;
    }

    const view = seatViews[section] || seatViews["114"];

    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();

    const endPos = new THREE.Vector3(
        view.pos[0],
        view.pos[1],
        view.pos[2]
    );

    const endTarget = new THREE.Vector3(
        view.target[0],
        view.target[1],
        view.target[2]
    );

    let progress = 0;

    const duration = 500;

    const startTime = performance.now();

    function animateCamera(now) {

        const elapsed = now - startTime;

        progress = Math.min(1, elapsed / duration);

        const ease = 1 - Math.pow(1 - progress, 3);

        camera.position.lerpVectors(startPos, endPos, ease);

        controls.target.lerpVectors(
            startTarget,
            endTarget,
            ease
        );

        controls.update();

        if (progress < 1) {
            requestAnimationFrame(animateCamera);
        }
    }

    requestAnimationFrame(animateCamera);
}

// --- Listen for messages ---
window.addEventListener("message", (event) => {

    if (event.data && event.data.type === "SET_SEAT") {

        const seatData = event.data.data;

        setSeatView(
            seatData.section,
            seatData.row
        );
    }
});

// Default view
setSeatView("114", "K");

// --- Animation Loop ---
let time = 0;

function animate() {

    requestAnimationFrame(animate);

    time += 0.016;

    spotLight.intensity =
        0.5 + Math.sin(time * 3) * 0.2;

    rimLight.intensity =
        0.4 + Math.sin(time * 2.5) * 0.15;

    controls.update();

    renderer.render(scene, camera);
}

animate();

// Resize
window.addEventListener("resize", onWindowResize);

function onWindowResize() {

    camera.aspect =
        window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
}

console.log("ViewMe Widget Loaded");