import * as THREE from "./libs/three.module.js";
import { OrbitControls } from "./libs/OrbitControls.js";

// --- Scene ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050b1a);
scene.fog = new THREE.FogExp2(0x050b1a, 0.008);

// --- Camera ---
const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
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
controls.target.set(0, 2, 0);

// --- Lights ---
const ambientLight = new THREE.AmbientLight(0x404060);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xfff5e0, 1.2);
mainLight.position.set(5, 10, 7);
mainLight.castShadow = true;
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
const stage = new THREE.Mesh(
    new THREE.BoxGeometry(5, 0.2, 3.5),
    new THREE.MeshStandardMaterial({ color: 0xdd8866 })
);
stage.position.set(0, -0.1, 2);
scene.add(stage);

// --- ADDITIONS START HERE 🔥 ---

// Stage front
const frontLip = new THREE.Mesh(
    new THREE.BoxGeometry(5.2, 0.1, 0.4),
    new THREE.MeshStandardMaterial({ color: 0xcc6644 })
);
frontLip.position.set(0, 0, 3.8);
scene.add(frontLip);

// Screen
const screen = new THREE.Mesh(
    new THREE.BoxGeometry(5.5, 3, 0.1),
    new THREE.MeshStandardMaterial({
        color: 0x2266aa,
        emissive: 0x004466,
        emissiveIntensity: 0.6,
    })
);
screen.position.set(0, 1.8, -1);
scene.add(screen);

// Truss ring
const truss = new THREE.Mesh(
    new THREE.TorusGeometry(2, 0.08, 32, 100),
    new THREE.MeshStandardMaterial({ color: 0xccaaff })
);
truss.rotation.x = Math.PI / 2;
truss.position.set(0, 2.8, 0.8);
scene.add(truss);

// Crowd
for (let i = -7; i <= 7; i += 1.2) {
    for (let j = -2; j <= 0; j += 0.8) {
        if (Math.random() > 0.65) continue;

        const person = new THREE.Mesh(
            new THREE.BoxGeometry(0.35, 0.55, 0.35),
            new THREE.MeshStandardMaterial({ color: 0x4a6c8f })
        );

        person.position.set(i, -0.15, j - 1.5);
        scene.add(person);
    }
}

// Section markers
[
    { id: "110", pos: [-2.5, 0.8, 3.8] },
    { id: "114", pos: [2.2, 0.8, 3.5] },
    { id: "120", pos: [3.8, 0.6, 1.5] },
    { id: "334", pos: [-3.2, 2.0, 5.5] },
].forEach((sec) => {
    const marker = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.1, 0.6),
        new THREE.MeshStandardMaterial({ color: 0xffaa66 })
    );
    marker.position.set(...sec.pos);
    scene.add(marker);
});

// Pillar
const pillar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.4, 2.5, 6),
    new THREE.MeshStandardMaterial({ color: 0xaa9988 })
);
pillar.position.set(-3.5, 0.6, 3.2);
scene.add(pillar);

// Grid
const grid = new THREE.GridHelper(25, 15);
grid.position.y = -0.3;
scene.add(grid);

// --- ADDITIONS END ---

// --- Seat Views ---
const seatViews = {
    110: { pos: [-2.0, 2.2, 5.2], target: [0, 1.8, 1.2] },
    114: { pos: [2.2, 2.0, 5.0], target: [0.2, 1.8, 1.5] },
    334: { pos: [-3.5, 3.8, 8.5], target: [0, 2.0, 1.0] },
    120: { pos: [4.0, 1.8, 4.2], target: [-0.3, 1.8, 1.3] },
};

function setSeatView(section, row) {
    const badge = document.getElementById("seatBadge");
    if (badge) {
        badge.innerHTML = `📍 Section ${section} | Row ${row || "?"}`;
    }

    const view = seatViews[section] || seatViews["114"];

    const endPos = new THREE.Vector3(...view.pos);
    const endTarget = new THREE.Vector3(...view.target);

    camera.position.copy(endPos);
    controls.target.copy(endTarget);
    controls.update();
}

// --- Listen ---
window.addEventListener("message", (event) => {
    if (event.data?.type === "SET_SEAT") {
        setSeatView(event.data.data.section, event.data.data.row);
    }
});

// Default
setSeatView("114", "K");

// --- Animate ---
let time = 0;
function animate() {
    requestAnimationFrame(animate);
    time += 0.016;

    screen.material.emissiveIntensity =
        0.5 + Math.sin(time * 6) * 0.2;

    controls.update();
    renderer.render(scene, camera);
}
animate();

// Resize
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});