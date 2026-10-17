import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { EffectComposer } from "https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js";

// ============================================================
// HUD / UI
// ============================================================
const root = document.querySelector("#game");
root.innerHTML = `
<div id="hud">
  <b>NEON <i>RUSH</i><small> NIGHT DRIVE</small></b>
  <div>
    SCORE <strong id="score">0000</strong><br>
    <strong id="speed">0</strong> KM/H<br>
    <span id="combo" style="font-size:9px;color:#ff7ce8">x1</span>
  </div>
</div>
<div id="controls">
  <button id="left">◀</button>
  <button id="boost">NITRO</button>
  <button id="right">▶</button>
</div>
<div id="overlay">
  <section>
    <small>OPEN THE THROTTLE • OWN THE NIGHT</small>
    <h1 id="heading">NEON<br>RUSH</h1>
    <p id="message">A neon-soaked 3D night drive.</p>
    <button id="start">START DRIVE</button>
    <p>Tap ◀ ▶ or swipe to steer</p>
    <p id="status">Building the city…</p>
    <p id="highscore" style="color:#ffd166;font-size:11px"></p>
  </section>
</div>`;

const css = document.createElement("style");
css.textContent = `
#hud{position:absolute;z-index:2;top:14px;left:14px;right:14px;display:flex;justify-content:space-between;align-items:start;font-size:10px;letter-spacing:1px;text-shadow:0 0 12px #00eaff;pointer-events:none}
#hud b{font-size:19px;font-style:italic}#hud i{color:#ff35dc}
#hud small{display:block;font-size:8px;color:#72f6ff;letter-spacing:2px}
#hud div{text-align:right;background:#061027d9;border:1px solid #31eaff88;border-radius:10px;padding:8px 11px}
#hud strong{font-size:16px;color:#62f8ff}
#controls{position:absolute;z-index:3;left:18px;right:18px;bottom:24px;display:flex;justify-content:space-between;align-items:center;pointer-events:none}
button{pointer-events:auto;touch-action:manipulation;border:1px solid #3beaff;border-radius:15px;background:#07152be8;color:white;font-weight:900;padding:15px 22px;box-shadow:0 0 22px #00dfff44}
#boost{color:#ff7ce8;border-color:#ff35d4;font-size:12px;letter-spacing:2px}
#overlay{position:absolute;z-index:4;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;background:linear-gradient(#03061655,#030616df)}
#overlay.off{display:none}
section{width:90%;max-width:420px;padding:24px 16px;background:#061027e8;border:1px solid #31eaff88;border-radius:22px;box-shadow:0 0 55px #8a20ff33}
section small{color:#65f6ff;letter-spacing:2px}
h1{font-size:clamp(54px,16vw,78px);font-style:italic;line-height:.82;margin:20px 0;text-shadow:0 0 16px #00dfff,0 0 36px #b300ff}
section p{font-size:12px;color:#bad7ed}
#start{background:linear-gradient(100deg,#00c7ff,#9226ff,#ff22bf);border:0;letter-spacing:2px;padding:15px 28px}
`;
document.head.append(css);

// ============================================================
// SCENE SETUP
// ============================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030512);
scene.fog = new THREE.FogExp2(0x030512, 0.0064);

const camera = new THREE.PerspectiveCamera(67, innerWidth / innerHeight, 0.1, 320);
camera.position.set(0, 4.4, 11.8);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.6));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;
root.prepend(renderer.domElement);

// Bloom post-processing
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(innerWidth, innerHeight),
  1.4,   // strength
  0.5,   // radius
  0.85   // threshold
);
composer.addPass(bloomPass);

// Lights
scene.add(new THREE.HemisphereLight(0x9acbff, 0x12001f, 1.8));
const key = new THREE.DirectionalLight(0xb8d7ff, 2.7);
key.position.set(-8, 17, 8);
scene.add(key);
const glowBlue = new THREE.PointLight(0x087bff, 30, 60);
glowBlue.position.set(-3, 8, -20);
scene.add(glowBlue);
const glowPink = new THREE.PointLight(0xf500b8, 24, 55);
glowPink.position.set(5, 7, -34);
scene.add(glowPink);

// Materials
function material(color, emissive = 0, ei = 0.3, metal = 0.2, rough = 0.5) {
  return new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: ei, metalness: metal, roughness: rough });
}
const cyan = material(0x19eaff, 0x00bfff, 2.2, 0.25, 0.3);
const magenta = material(0xff27cb, 0xff00b8, 2, 0.2, 0.3);
const warm = material(0xffe3a1, 0xffa53d, 2, 0.1, 0.3);
const dark = material(0x050917);
const asphalt = material(0x101626, 0x030610, 0.35, 0.3, 0.65);

// ============================================================
// ROAD + GROUND
// ============================================================
const ground = new THREE.Mesh(new THREE.PlaneGeometry(500, 400), material(0x050817));
ground.rotation.x = -Math.PI / 2;
ground.position.set(0, -0.25, -120);
scene.add(ground);

const road = new THREE.Mesh(new THREE.PlaneGeometry(15, 340), asphalt);
road.rotation.x = -Math.PI / 2;
road.position.set(0, -0.13, -130);
scene.add(road);

for (const x of [-7.25, 7.25]) {
  const line = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.025, 340), cyan);
  line.position.set(x, -0.105, -130);
  scene.add(line);
}

const dashes = [];
for (let z = 25; z > -310; z -= 8)
  for (const x of [-2.5, 2.5]) {
    let d = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.025, 3.1), material(0xb1faff, 0x2ceeff, 1.2));
    d.position.set(x, -0.095, z);
    scene.add(d);
    dashes.push(d);
  }

for (let i = 0; i < 32; i++) {
  let p = new THREE.Mesh(new THREE.PlaneGeometry(1.2 + Math.random() * 2, 2 + Math.random() * 5), material(0x123047, 0x00628a, 0.35));
  p.rotation.x = -Math.PI / 2;
  p.position.set((Math.random() - 0.5) * 12, -0.09, -Math.random() * 290);
  scene.add(p);
}

// ============================================================
// BUILDINGS (with billboards)
// ============================================================
const buildings = [];
const billboards = [];

function addBillboardTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const hues = [190, 300, 45, 330];
  const hue = hues[Math.floor(Math.random() * hues.length)];
  ctx.fillStyle = `hsl(${hue}, 100%, 8%)`;
  ctx.fillRect(0, 0, 256, 128);
  ctx.strokeStyle = `hsl(${hue}, 100%, 60%)`;
  ctx.lineWidth = 6;
  ctx.strokeRect(4, 4, 248, 120);
  const words = ["NEON", "RUSH", "DRIVE", "NIGHT", "PULSE", "VELOCITY", "SYNTH", "CHROME"];
  ctx.fillStyle = `hsl(${hue}, 100%, 75%)`;
  ctx.font = "bold 44px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(words[Math.floor(Math.random() * words.length)], 128, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function addBuilding(side, z) {
  const g = new THREE.Group();
  let w = 2.5 + Math.random() * 3.2, h = 9 + Math.random() * 26, dep = 3 + Math.random() * 5;
  const palette = side < 0 ? [0x101e3a, 0x14203d, 0x18233b, 0x101b31] : [0x24112f, 0x1a1734, 0x27152d, 0x151a32];
  const wall = material(palette[Math.floor(Math.random() * palette.length)], side < 0 ? 0x06153a : 0x250529, 0.6, 0.35, 0.48);

  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, dep), wall);
  body.position.y = h / 2;
  g.add(body);

  const ledgeMat = side < 0 ? cyan : magenta;
  for (let y = 2.7; y < h; y += 3.2) {
    let ledge = new THREE.Mesh(new THREE.BoxGeometry(w + 0.16, 0.11, dep + 0.16), material(0x27314a, side < 0 ? 0x004c71 : 0x5d064d, 0.8, 0.55, 0.32));
    ledge.position.y = y;
    g.add(ledge);
  }

  let facadeX = -side * (w / 2 + 0.035);
  for (let y = 0.9; y < h - 1; y += 1.15)
    for (let zz = -dep / 2 + 0.42; zz < dep / 2; zz += 0.72) {
      if (Math.random() < 0.2) continue;
      let wc = Math.random() > 0.77 ? warm : (side < 0 ? cyan : magenta);
      let win = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.56, 0.39), wc);
      win.position.set(facadeX, y, zz);
      g.add(win);
      if (Math.random() > 0.8) {
        let frame = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.65, 0.47), material(0x27344f));
        frame.position.set(facadeX * 0.99, y, zz);
        g.add(frame);
      }
    }

  for (let zz of [-dep * 0.38, dep * 0.38]) {
    let rib = new THREE.Mesh(new THREE.BoxGeometry(0.08, h * 0.85, 0.08), ledgeMat);
    rib.position.set(facadeX * 1.02, h * 0.48, zz);
    g.add(rib);
  }

  const top = new THREE.Mesh(new THREE.BoxGeometry(w * 0.72, 0.55, dep * 0.7), material(0x10172b, side < 0 ? 0x063b65 : 0x4b0641, 0.8));
  top.position.set(0, h + 0.25, 0);
  g.add(top);

  if (Math.random() > 0.35) {
    let antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.08, 2.4, 8), material(0x60748c, 0x00bde8, 0.8));
    antenna.position.y = h + 1.7;
    g.add(antenna);
    let beacon = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), side < 0 ? cyan : magenta);
    beacon.position.y = h + 2.95;
    g.add(beacon);
  }

  // Billboard / sign on facade
  if (Math.random() > 0.55) {
    const tex = addBillboardTexture();
    const bw = 1.6 + Math.random() * 1.4;
    const bh = bw * 0.5;
    const billboard = new THREE.Mesh(
      new THREE.PlaneGeometry(bw, bh),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true })
    );
    billboard.position.set(facadeX * 1.05, h * 0.45 + Math.random() * h * 0.2, 0);
    billboard.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
    g.add(billboard);
    billboards.push({ mesh: billboard, side });
  } else if (Math.random() > 0.45) {
    let sign = new THREE.Mesh(new THREE.BoxGeometry(0.13, 1.8, Math.min(dep * 0.65, 2.5)), side < 0 ? magenta : cyan);
    sign.position.set(facadeX * 1.04, h * 0.58, 0);
    g.add(sign);
    for (let sy of [-0.9, 0.9]) {
      let trim = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.05, Math.min(dep * 0.7, 2.7)), warm);
      trim.position.set(facadeX * 1.045, h * 0.58 + sy, 0);
      g.add(trim);
    }
  }

  g.position.set(side * (9 + Math.random() * 12), 0, z);
  scene.add(g);
  buildings.push({ g, side, w, h, dep });
}

for (const s of [-1, 1]) for (let i = 0; i < 54; i++) addBuilding(s, 24 - i * 6.1);

// ============================================================
// STREET LAMPS
// ============================================================
const lamps = [];
for (const s of [-1, 1])
  for (let z = 18; z > -300; z -= 18) {
    let g = new THREE.Group(), steel = material(0x53647e, 0x101d40, 0.55, 0.8, 0.27);
    let foot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.22, 16), steel);
    foot.position.y = 0.11;
    g.add(foot);
    let pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.14, 6.2, 12), steel);
    pole.position.y = 3.15;
    g.add(pole);
    let bend = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.065, 8, 14, Math.PI / 2), steel);
    bend.rotation.z = s < 0 ? Math.PI : 0;
    bend.position.set(-s * 0.48, 6.05, 0);
    g.add(bend);
    let arm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 1.25, 10), steel);
    arm.rotation.z = Math.PI / 2;
    arm.position.set(-s * 1.0, 6.35, 0);
    g.add(arm);
    let hood = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.2, 0.72), material(0x15233a, 0x172f50, 0.8, 0.4, 0.3));
    hood.position.set(-s * 1.55, 6.25, 0);
    g.add(hood);
    let lens = new THREE.Mesh(new THREE.BoxGeometry(0.47, 0.045, 0.52), s < 0 ? cyan : magenta);
    lens.position.set(-s * 1.55, 6.13, 0);
    g.add(lens);
    let light = new THREE.PointLight(s < 0 ? 0x17cfff : 0xff22c8, 8, 11);
    light.position.set(-s * 1.55, 5.95, 0);
    g.add(light);
    g.position.set(s * 7.7, 0, z);
    scene.add(g);
    lamps.push(g);
  }

// ============================================================
// PEDESTRIANS (InstancedMesh)
// ============================================================
const PED_COUNT = 90;
const pedGeo = new THREE.CapsuleGeometry(0.16, 0.55, 4, 8);
const pedMat = new THREE.MeshStandardMaterial({ color: 0xffccaa, emissive: 0x221100, emissiveIntensity: 0.3 });
const peds = new THREE.InstancedMesh(pedGeo, pedMat, PED_COUNT);
peds.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
scene.add(peds);
const pedData = [];
const dummy = new THREE.Object3D();
for (let i = 0; i < PED_COUNT; i++) {
  const side = Math.random() > 0.5 ? 1 : -1;
  pedData.push({
    x: side * (7.9 + Math.random() * 1.6),
    z: -Math.random() * 290,
    speed: 0.6 + Math.random() * 1.2,
    phase: Math.random() * Math.PI * 2,
  });
}

function updatePeds(dt, moveZ) {
  for (let i = 0; i < PED_COUNT; i++) {
    const p = pedData[i];
    p.z += moveZ + p.speed * dt;
    if (p.z > 25) p.z -= 310;
    dummy.position.set(p.x, 0.55 + Math.abs(Math.sin(clock.elapsedTime * p.speed * 6 + p.phase)) * 0.06, p.z);
    dummy.rotation.y = Math.sin(clock.elapsedTime * 2 + p.phase) * 0.3;
    dummy.updateMatrix();
    peds.setMatrixAt(i, dummy.matrix);
  }
  peds.instanceMatrix.needsUpdate = true;
}

// ============================================================
// CAR (improved procedural)
// ============================================================
function createCar(color, isPlayer = false) {
  const car = new THREE.Group();
  const paint = new THREE.MeshPhysicalMaterial({
    color, metalness: 0.78, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.12,
    emissive: color, emissiveIntensity: isPlayer ? 0.16 : 0.09,
  });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x071a2b, metalness: 0.55, roughness: 0.13, clearcoat: 1,
    emissive: 0x05243c, emissiveIntensity: 0.7,
  });
  const rubber = material(0x080a10, 0, 0.05, 0.05, 0.88);
  const rim = material(0x9bc7d8, 0x133d54, 0.7, 0.9, 0.22);
  const head = material(0xdfffff, 0xa8faff, 3, 0.1, 0.2);
  const tail = material(0xff244e, 0xff003c, 2.8, 0.1, 0.25);

  function mesh(geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) {
    let m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    m.castShadow = true;
    m.receiveShadow = true;
    car.add(m);
    return m;
  }

  // Tapered body rings
  const rings = [
    { z: -2.05, w: 0.48, y: 0.48, top: 0.68 },
    { z: -1.55, w: 0.82, y: 0.43, top: 0.83 },
    { z: -0.75, w: 0.91, y: 0.42, top: 0.77 },
    { z: 0.65, w: 0.96, y: 0.43, top: 0.78 },
    { z: 1.55, w: 0.83, y: 0.45, top: 0.69 },
    { z: 1.9, w: 0.65, y: 0.47, top: 0.61 },
  ];
  let verts = [], indices = [];
  for (const r of rings) verts.push(-r.w, r.y, r.z, r.w, r.y, r.z, -r.w, r.top, r.z, r.w, r.top, r.z);
  for (let i = 0; i < rings.length - 1; i++) {
    let a = i * 4, b = a + 4;
    indices.push(a, b, a + 2, a + 2, b, b + 2, a + 1, a + 3, b + 1, a + 3, b + 3, b + 1, a, a + 1, b, a + 1, b + 1, b);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  mesh(geo, paint, 0, 0, 0);

  mesh(new THREE.BoxGeometry(1.15, 0.10, 0.82), paint, 0, 0.69, -1.35);
  mesh(new THREE.BoxGeometry(1.22, 0.09, 0.55), paint, 0, 0.65, 1.35);
  for (const x of [-0.91, 0.91]) {
    mesh(new THREE.BoxGeometry(0.1, 0.14, 2.35), paint, x, 0.39, 0);
    mesh(new THREE.BoxGeometry(0.035, 0.045, 1.4), isPlayer ? cyan : magenta, x * 1.04, 0.32, 0);
  }

  function panel(points, matr) {
    let v = [];
    for (const p of points) v.push(...p);
    let gg = new THREE.BufferGeometry();
    gg.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    gg.setIndex([0, 1, 2, 0, 2, 3]);
    gg.computeVertexNormals();
    return mesh(gg, matr, 0, 0, 0);
  }
  panel([[-0.68, 0.77, -0.65], [0.68, 0.77, -0.65], [0.47, 1.22, 0.45], [-0.47, 1.22, 0.45]], glass);
  panel([[-0.47, 1.22, 0.45], [0.47, 1.22, 0.45], [0.67, 0.75, 0.75], [-0.67, 0.75, 0.75]], glass);
  mesh(new THREE.BoxGeometry(1.05, 0.055, 0.07), paint, 0, 1.23, 0.43);
  for (const x of [-0.69, 0.69]) mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.53, 8), rim, x, 0.97, -0.1, 0, 0, x < 0 ? -0.23 : 0.23);

  for (const x of [-0.96, 0.96])
    for (const z of [-1.2, 1.15]) {
      mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.22, 24), rubber, x, 0.37, z, 0, 0, Math.PI / 2);
      mesh(new THREE.CylinderGeometry(0.255, 0.255, 0.235, 20), rim, x * 1.015, 0.37, z, 0, 0, Math.PI / 2);
      mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.25, 14), isPlayer ? cyan : magenta, x * 1.025, 0.37, z, 0, 0, Math.PI / 2);
      for (let k = 0; k < 6; k++) {
        let a = k * Math.PI / 3;
        mesh(new THREE.BoxGeometry(0.035, 0.035, 0.22), head, x * 1.03, 0.37 + Math.sin(a) * 0.15, z + Math.cos(a) * 0.15, 0, a, 0);
      }
    }

  for (const x of [-0.57, 0.57]) {
    mesh(new THREE.BoxGeometry(0.38, 0.09, 0.06), head, x, 0.59, -1.94);
    mesh(new THREE.BoxGeometry(0.34, 0.055, 0.05), tail, x, 0.56, 1.83);
  }
  mesh(new THREE.BoxGeometry(1.38, 0.07, 0.15), paint, 0, 0.92, 1.65);
  for (const x of [-0.55, 0.55]) {
    mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.48, 8), paint, x, 0.96, 1.55);
    mesh(new THREE.BoxGeometry(0.06, 0.05, 0.48), paint, x, 1.18, 1.58);
  }
  mesh(new THREE.BoxGeometry(1.5, 0.09, 0.28), paint, 0, 1.4, 1.64);
  mesh(new THREE.BoxGeometry(1.5, 0.035, 0.3), isPlayer ? cyan : magenta, 0, 0.23, 0);
  const under = new THREE.PointLight(isPlayer ? 0x00cfff : 0xff00a8, isPlayer ? 3 : 1.5, 5);
  under.position.set(0, 0.25, 0);
  car.add(under);

  if (isPlayer) {
    for (const x of [-0.48, 0.48]) {
      let beam = new THREE.SpotLight(0xb9faff, 18, 36, Math.PI / 8, 0.5, 1.4);
      beam.position.set(x, 0.62, -1.7);
      beam.target.position.set(x * 0.5, 0.1, -18);
      car.add(beam, beam.target);
    }
  }
  return car;
}

const player = createCar(0x087dff, true);
player.position.set(0, 0, 4);
scene.add(player);

// ============================================================
// GAME STATE
// ============================================================
let traffic = [];
let lane = 1;
let score = 0;
let speed = 145;
let running = false;
let spawn = 0.7;
let boost = 0;
let difficulty = 0;
let combo = 1;
let comboTimer = 0;
let bestScore = Number(localStorage.getItem("neonRushBest") || 0);
const $ = (id) => document.getElementById(id);
const overlay = $("overlay");
$("highscore").textContent = bestScore > 0 ? `BEST: ${bestScore}` : "";

function steer(d) {
  if (running) lane = Math.max(0, Math.min(2, lane + d));
}
$("left").onpointerdown = () => steer(-1);
$("right").onpointerdown = () => steer(1);
$("boost").onpointerdown = async () => {
  if (!running) return;
  // try AdsGram reward; fallback to free boost if ad unavailable
  const ok = await window.showNeonRewardAd?.();
  boost = ok ? 5 : 2.5;
};
addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a") steer(-1);
  if (e.key === "ArrowRight" || e.key === "d") steer(1);
  if (e.key === " " && !running) begin();
  if (e.key === "Shift") boost = 2.8;
});

let sx = null;
renderer.domElement.addEventListener("touchstart", (e) => (sx = e.touches[0].clientX), { passive: true });
renderer.domElement.addEventListener("touchend", (e) => {
  if (sx !== null) {
    let dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 28) steer(dx > 0 ? 1 : -1);
    sx = null;
  }
}, { passive: true });

// ============================================================
// SPAWNING
// ============================================================
function spawnTraffic() {
  let l = Math.floor(Math.random() * 3);
  let colors = [0xff247e, 0xffb323, 0x8d43ff, 0x00e6ad, 0xe8f6ff];
  let c = createCar(colors[Math.floor(Math.random() * colors.length)]);
  c.scale.setScalar(0.83 + Math.random() * 0.09);
  c.position.set((l - 1) * 3, 0, -125);
  // traffic own speed multiplier
  c.userData.trafficSpeed = 0.6 + Math.random() * 0.5;
  scene.add(c);
  traffic.push(c);
}

// ============================================================
// GAME LOOP
// ============================================================
function begin() {
  traffic.forEach((t) => scene.remove(t));
  traffic = [];
  lane = 1;
  score = 0;
  speed = 145;
  spawn = 0.7;
  boost = 0;
  difficulty = 0;
  combo = 1;
  comboTimer = 0;
  running = true;
  overlay.classList.add("off");
}
$("start").onclick = begin;

function endRun() {
  running = false;
  overlay.classList.remove("off");
  $("heading").innerHTML = "NIGHT<br>OVER";
  $("message").textContent = "Distance score: " + Math.floor(score) + " · Take another run";
  $("start").textContent = "DRIVE AGAIN";
  if (score > bestScore) {
    bestScore = Math.floor(score);
    localStorage.setItem("neonRushBest", bestScore);
    $("highscore").textContent = `BEST: ${bestScore}`;
  }
}

const clock = new THREE.Clock();
const playerBox = new THREE.Box3();
const tempBox = new THREE.Box3();

function frame() {
  requestAnimationFrame(frame);
  let dt = Math.min(clock.getDelta(), 0.04);
  let target = (lane - 1) * 3;

  // Car movement
  player.position.x += (target - player.position.x) * Math.min(1, dt * 6.8);
  player.rotation.z = -(player.position.x - target) * 0.035;
  player.rotation.y += (target - player.position.x) * 0.025;

  // Camera follow
  let camX = player.position.x * 0.23;
  camera.position.x += (camX - camera.position.x) * dt * 2.5;
  camera.position.y = 4.3 + (boost > 0 ? 0.18 : 0);
  camera.lookAt(player.position.x * 0.1, 0.72, -9);

  if (running) {
    // Difficulty ramps up over time
    difficulty = Math.min(1, score / 5000);
    let baseSpeed = 145 + difficulty * 110;
    let v = baseSpeed + (boost > 0 ? 95 : 0);
    boost = Math.max(0, boost - dt);
    score += dt * v * 0.12;

    // Combo system: near-misses increase combo
    comboTimer = Math.max(0, comboTimer - dt);
    if (comboTimer === 0) combo = 1;

    $("score").textContent = String(Math.floor(score)).padStart(4, "0");
    $("speed").textContent = Math.floor(v);
    $("combo").textContent = `x${combo}`;

    // Spawn
    spawn -= dt;
    if (spawn <= 0) {
      spawnTraffic();
      let baseSpawn = Math.max(0.32, 1.15 - v * 0.0024);
      spawn = Math.max(0.3, baseSpawn - difficulty * 0.2) + Math.random() * 0.22;
    }

    // Move world
    for (let o of dashes) {
      o.position.z += v * dt * 0.24;
      if (o.position.z > 25) o.position.z -= 340;
    }
    for (let b of buildings) {
      b.g.position.z += v * dt * 0.115;
      if (b.g.position.z > 34) b.g.position.z -= 330;
    }
    for (let l of lamps) {
      l.position.z += v * dt * 0.24;
      if (l.position.z > 24) l.position.z -= 318;
    }

    updatePeds(dt, v * dt * 0.24);

    // Collision + traffic update
    playerBox.setFromObject(player).expandByScalar(-0.35); // tighten
    for (let i = traffic.length - 1; i >= 0; i--) {
      let t = traffic[i];
      let tSpeed = t.userData.trafficSpeed || 1;
      t.position.z += v * dt * 0.24 * (0.6 + tSpeed * 0.4);
      t.rotation.y = Math.sin(clock.elapsedTime * 2 + i) * 0.015;

      tempBox.setFromObject(t).expandByScalar(-0.4);
      if (playerBox.intersectsBox(tempBox)) {
        endRun();
        break;
      }
      // Near miss => combo up
      if (Math.abs(t.position.z - player.position.z) < 2.4 && Math.abs(t.position.x - player.position.x) < 1.9) {
        if (comboTimer <= 0) {
          combo = Math.min(9, combo + 1);
          comboTimer = 1.2;
        }
      }
      if (t.position.z > 20) {
        scene.remove(t);
        traffic.splice(i, 1);
      }
    }
  }

  // Light pulse
  glowBlue.intensity = 27 + (Math.sin(clock.elapsedTime * 1.8) + 1) * 5;
  glowPink.intensity = 22 + (Math.cos(clock.elapsedTime * 1.4) + 1) * 4;

  composer.render();
}
frame();

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.6));
  composer.setSize(innerWidth, innerHeight);
});

// ============================================================
// TELEGRAM + ADSGRAM
// ============================================================
try {
  const tg = window.Telegram?.WebApp;
  if (tg) { tg.ready(); tg.expand(); }
  $("status").textContent = "3D engine ready · Press START DRIVE";
} catch (e) {
  $("status").textContent = "Press START DRIVE";
}

const ADSGRAM_BLOCK_ID = "YOUR_ADSGRAM_BLOCK_ID";
window.showNeonRewardAd = async function () {
  if (!window.Adsgram || ADSGRAM_BLOCK_ID === "YOUR_ADSGRAM_BLOCK_ID") {
    return false; // no ad, fallback to short boost
  }
  try {
    let controller = window.Adsgram.init({ blockId: ADSGRAM_BLOCK_ID });
    await controller.show();
    return true;
  } catch (e) {
    console.warn(e);
    return false;
  }
};
