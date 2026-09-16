// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Sky blue
scene.fog = new THREE.Fog(0x87ceeb, 50, 100);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(2, 1.6, 2);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowShadowMap;
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 10, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.far = 50;
scene.add(directionalLight);

// Point lights in each room
const pointLightLiving = new THREE.PointLight(0xffffcc, 0.8, 30);
pointLightLiving.position.set(5, 2.5, 5);
scene.add(pointLightLiving);

const pointLightKitchen = new THREE.PointLight(0xffffcc, 0.8, 20);
pointLightKitchen.position.set(1.5, 2.5, 2);
scene.add(pointLightKitchen);

// Apartment dimensions
const width = 11.6;
const depth = 11.3;
const ceilingHeight = 2.8;
const wallThickness = 0.2;

// Create floor
const floorGeometry = new THREE.PlaneGeometry(width, depth);
const floorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xd2b48c,
    roughness: 0.8,
    metalness: 0
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Create ceiling
const ceilingGeometry = new THREE.PlaneGeometry(width, depth);
const ceilingMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff,
    roughness: 0.9,
    metalness: 0
});
const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = ceilingHeight;
ceiling.receiveShadow = true;
scene.add(ceiling);

// Create outer walls
function createWall(x, y, z, width, height, depth) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0xf5f5f5,
        roughness: 0.7,
        metalness: 0
    });
    const wall = new THREE.Mesh(geometry, material);
    wall.position.set(x, y, z);
    wall.castShadow = true;
    wall.receiveShadow = true;
    scene.add(wall);
    return wall;
}

// Outer walls
createWall(0, ceilingHeight / 2, -depth / 2, width, ceilingHeight, wallThickness); // Back
createWall(0, ceilingHeight / 2, depth / 2, width, ceilingHeight, wallThickness); // Front
createWall(-width / 2, ceilingHeight / 2, 0, wallThickness, ceilingHeight, depth); // Left
createWall(width / 2, ceilingHeight / 2, 0, wallThickness, ceilingHeight, depth); // Right

// Inner walls based on floor plan
// Living room separator wall
createWall(-2, ceilingHeight / 2, 1, 4, ceilingHeight, wallThickness);

// Kitchen wall
createWall(1.5, ceilingHeight / 2, 3, wallThickness, ceilingHeight, 3);

// Bedroom 1 walls
createWall(-4, ceilingHeight / 2, -2, wallThickness, ceilingHeight, 3);
createWall(-3.5, ceilingHeight / 2, -4.5, 3, ceilingHeight, wallThickness);

// Bedroom 2 walls
createWall(3, ceilingHeight / 2, -3, wallThickness, ceilingHeight, 3);
createWall(4.5, ceilingHeight / 2, -1, 3, ceilingHeight, wallThickness);

// Bathroom walls
createWall(-2, ceilingHeight / 2, 4.5, 2, ceilingHeight, wallThickness);
createWall(-0.5, ceilingHeight / 2, 3.5, wallThickness, ceilingHeight, 2);

// Create furniture
function createSofa(x, y, z, color = 0x8B4513) {
    const sofa = new THREE.Group();
    const backGeometry = new THREE.BoxGeometry(2, 0.8, 0.4);
    const seatGeometry = new THREE.BoxGeometry(2, 0.4, 0.8);
    const material = new THREE.MeshStandardMaterial({ 
        color: color,
        roughness: 0.6,
        metalness: 0
    });
    
    const backrest = new THREE.Mesh(backGeometry, material);
    backrest.position.y = 0.4;
    backrest.position.z = -0.2;
    backrest.castShadow = true;
    sofa.add(backrest);
    
    const seat = new THREE.Mesh(seatGeometry, material);
    seat.castShadow = true;
    sofa.add(seat);
    
    sofa.position.set(x, y, z);
    scene.add(sofa);
    return sofa;
}

function createTable(x, y, z, w = 1, d = 1, h = 0.75) {
    const table = new THREE.Group();
    const topGeometry = new THREE.BoxGeometry(w, 0.1, d);
    const legGeometry = new THREE.BoxGeometry(0.1, h - 0.05, 0.1);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        roughness: 0.7,
        metalness: 0
    });
    
    const top = new THREE.Mesh(topGeometry, material);
    top.position.y = h;
    top.castShadow = true;
    table.add(top);
    
    const leg1 = new THREE.Mesh(legGeometry, material);
    leg1.position.set(-w/2 + 0.1, h/2, -d/2 + 0.1);
    leg1.castShadow = true;
    table.add(leg1);
    
    const leg2 = new THREE.Mesh(legGeometry, material);
    leg2.position.set(w/2 - 0.1, h/2, -d/2 + 0.1);
    leg2.castShadow = true;
    table.add(leg2);
    
    const leg3 = new THREE.Mesh(legGeometry, material);
    leg3.position.set(-w/2 + 0.1, h/2, d/2 - 0.1);
    leg3.castShadow = true;
    table.add(leg3);
    
    const leg4 = new THREE.Mesh(legGeometry, material);
    leg4.position.set(w/2 - 0.1, h/2, d/2 - 0.1);
    leg4.castShadow = true;
    table.add(leg4);
    
    table.position.set(x, y, z);
    scene.add(table);
    return table;
}

function createBed(x, y, z, w = 1.4, l = 2) {
    const bed = new THREE.Group();
    const frameGeometry = new THREE.BoxGeometry(w, 0.2, l);
    const mattressGeometry = new THREE.BoxGeometry(w - 0.1, 0.3, l - 0.1);
    const pillowGeometry = new THREE.BoxGeometry(w - 0.2, 0.25, 0.4);
    
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const mattressMaterial = new THREE.MeshStandardMaterial({ color: 0xFF69B4 });
    const pillowMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.castShadow = true;
    bed.add(frame);
    
    const mattress = new THREE.Mesh(mattressGeometry, mattressMaterial);
    mattress.position.y = 0.3;
    mattress.castShadow = true;
    bed.add(mattress);
    
    const pillow = new THREE.Mesh(pillowGeometry, pillowMaterial);
    pillow.position.set(0, 0.6, -l/2 + 0.3);
    pillow.castShadow = true;
    bed.add(pillow);
    
    bed.position.set(x, y, z);
    scene.add(bed);
    return bed;
}

function createKitchenCounter(x, y, z, w = 2, d = 0.6) {
    const counter = new THREE.Group();
    const topGeometry = new THREE.BoxGeometry(w, 0.05, d);
    const bodyGeometry = new THREE.BoxGeometry(w, 0.8, d);
    
    const topMaterial = new THREE.MeshStandardMaterial({ color: 0x696969 });
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xA9A9A9 });
    
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.4;
    body.castShadow = true;
    counter.add(body);
    
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = 0.85;
    top.castShadow = true;
    counter.add(top);
    
    counter.position.set(x, y, z);
    scene.add(counter);
    return counter;
}

// Furnish the apartment

// Living Room (center-left area)
createSofa(-3, 0, 2, 0x8B4513);
createTable(-3, 0, 0, 1.5, 1.5, 0.5);

// Kitchen
createKitchenCounter(1, 0, 2.5, 2.5, 0.6);
createKitchenCounter(1, 0, 4.5, 2.5, 0.6);
createTable(0.5, 0, 3.5, 1, 1, 0.75);

// Bedroom 1
createBed(-4.5, 0, -3.5, 1.4, 2);
createTable(-3.5, 0, -4, 0.8, 0.8, 0.6);

// Bedroom 2
createBed(4, 0, -3.5, 1.4, 2);
createTable(5, 0, -4, 0.8, 0.8, 0.6);

// Create doors (simple frame representation)
function createDoor(x, y, z, width = 0.9, height = 2.4) {
    const doorFrame = new THREE.Group();
    const frameGeometry = new THREE.BoxGeometry(0.05, height, 0.05);
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    
    const leftFrame = new THREE.Mesh(frameGeometry, frameMaterial);
    leftFrame.position.x = -width / 2;
    leftFrame.castShadow = true;
    doorFrame.add(leftFrame);
    
    const rightFrame = new THREE.Mesh(frameGeometry, frameMaterial);
    rightFrame.position.x = width / 2;
    rightFrame.castShadow = true;
    doorFrame.add(rightFrame);
    
    doorFrame.position.set(x, height / 2, z);
    scene.add(doorFrame);
}

// Add doors
createDoor(-2, 0, 0);
createDoor(1.5, 0, 2);
createDoor(-4, 0, -2);
createDoor(3, 0, -2);

// Camera controls
const keys = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

let mouseDown = false;
let mouseX = 0;
let mouseY = 0;
let pitch = 0;
let yaw = 0;

document.addEventListener('mousedown', (e) => {
    mouseDown = true;
    mouseX = e.clientX;
    mouseY = e.clientY;
});

document.addEventListener('mousemove', (e) => {
    if (mouseDown) {
        const deltaX = e.clientX - mouseX;
        const deltaY = e.clientY - mouseY;
        
        yaw -= deltaX * 0.005;
        pitch -= deltaY * 0.005;
        
        pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
        
        mouseX = e.clientX;
        mouseY = e.clientY;
    }
});

document.addEventListener('mouseup', () => {
    mouseDown = false;
});

// Update camera rotation
function updateCamera() {
    const cosPitch = Math.cos(pitch);
    const direction = new THREE.Vector3(
        Math.sin(yaw) * cosPitch,
        Math.sin(pitch),
        Math.cos(yaw) * cosPitch
    );
    
    const right = new THREE.Vector3(
        Math.cos(yaw),
        0,
        -Math.sin(yaw)
    );
    
    const up = new THREE.Vector3(0, 1, 0);
    
    const speed = 0.1;
    
    if (keys['w'] || keys['W']) camera.position.addScaledVector(direction, speed);
    if (keys['s'] || keys['S']) camera.position.addScaledVector(direction, -speed);
    if (keys['a'] || keys['A']) camera.position.addScaledVector(right, -speed);
    if (keys['d'] || keys['D']) camera.position.addScaledVector(right, speed);
    if (keys[' ']) camera.position.y += speed * 0.5;
    if (keys['Control']) camera.position.y -= speed * 0.5;
    
    camera.position.y = Math.max(0.5, Math.min(ceilingHeight - 0.3, camera.position.y));
    
    const targetPos = camera.position.clone().add(direction);
    camera.lookAt(targetPos);
}

// Room navigation
window.goToRoom = function(room) {
    const positions = {
        living: { pos: new THREE.Vector3(-3, 1.6, 2), target: new THREE.Vector3(-2, 1.6, 1) },
        kitchen: { pos: new THREE.Vector3(1, 1.6, 3.5), target: new THREE.Vector3(2, 1.6, 3) },
        bedroom1: { pos: new THREE.Vector3(-4.5, 1.6, -3.5), target: new THREE.Vector3(-4, 1.6, -3) },
        bedroom2: { pos: new THREE.Vector3(4, 1.6, -3.5), target: new THREE.Vector3(4.5, 1.6, -3) }
    };
    
    if (positions[room]) {
        camera.position.copy(positions[room].pos);
        const dir = positions[room].target.clone().sub(camera.position).normalize();
        yaw = Math.atan2(dir.x, dir.z);
        pitch = Math.asin(dir.y);
    }
};

// Reset view
window.resetView = function() {
    camera.position.set(2, 1.6, 2);
    pitch = 0;
    yaw = 0;
};

// Walkthrough tour
let tourActive = false;
window.startWalkthrough = function() {
    if (tourActive) return;
    tourActive = true;
    
    const tourPath = [
        { pos: new THREE.Vector3(-3, 1.6, 2), duration: 3000, label: 'Living Room' },
        { pos: new THREE.Vector3(1, 1.6, 3.5), duration: 3000, label: 'Kitchen' },
        { pos: new THREE.Vector3(-4.5, 1.6, -3.5), duration: 3000, label: 'Bedroom 1' },
        { pos: new THREE.Vector3(4, 1.6, -3.5), duration: 3000, label: 'Bedroom 2' },
        { pos: new THREE.Vector3(-3, 1.6, 2), duration: 2000, label: 'Back to Living Room' }
    ];
    
    let currentStep = 0;
    
    function goToNextStep() {
        if (currentStep >= tourPath.length) {
            tourActive = false;
            return;
        }
        
        const step = tourPath[currentStep];
        const startPos = camera.position.clone();
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / 1500, 1);
            
            camera.position.lerpVectors(startPos, step.pos, progress);
            
            const dir = step.pos.clone().sub(camera.position).normalize();
            yaw = Math.atan2(dir.x, dir.z);
            pitch = Math.asin(Math.max(-1, Math.min(1, dir.y)));
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setTimeout(() => {
                    currentStep++;
                    goToNextStep();
                }, step.duration);
            }
        };
        
        animate();
    }
    
    goToNextStep();
};

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    updateCamera();
    
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
