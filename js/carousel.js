/**
 * Authors:
 *  - João Fidalgo, ist1103471
 *  - Tomás Cruz, ist1103425
 *  - Rodrigo Friães, ist1104139
 * Work time estimate per collaborator: 20h
 */

import * as THREE from 'three';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';

var scene, renderer;

//RINGS
var carousel, rings, innerRing, midRing, outerRing, center_disk, mobius;
var innerRing_animation = false;
var midRing_animation = false;
var outerRing_animation = false;

var upInner = true, upMid = true, upOuter = true;


// Cameras
var activeCameraNumber, camera1, camera2, camera3, camera4, camera5, camera6;

// Objects visibility
var wireframe = true;

// Graphic's clock 
const clock = new THREE.Clock();

// Movement constant variables
const ROTATION_SPEED = 0.5;
const MOVEMENT_SPEED = 4;

// Define cameras array
var cameras = [];


// Builder functions ----------------------------------------------------------------------------------------------
function buildBox(obj, x, y, z, width, height, length, color) {
    'use strict'
    var geometry = new THREE.BoxGeometry(width, height, length);
    var material = new THREE.MeshBasicMaterial({ color: color, wireframe: wireframe })
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function buildCylinder(obj, x, y, z, height, radiusTop, radiusBottom, color) {
    'use strict';
    var geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 50);
    var material = new THREE.MeshBasicMaterial({ color: color, wireframe: wireframe })
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function buildRing(obj, outerRadius, innerRadius, height, x, y, z, color) {
    'use strict';
    
    var shape = new THREE.Shape();
    shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false, 64); // Use innerRadius here
    var holePath = new THREE.Path();
    holePath.absarc(0, 0, innerRadius, 0, Math.PI * 2, true, 64); // Use outerRadius here
    shape.holes.push(holePath);

    var extrudeSettings = {
        steps: 1, // Increase the number of steps for smoother roundness
        depth: height,
        bevelEnabled: false,
        curveSegments: 64
    };

    var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    var material = new THREE.MeshBasicMaterial({ color: color, wireframe: wireframe });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function buildParametric(obj, x, y, z, parametricFunction, s) {
    var parametric = new THREE.Object3D();
    const geometry = new ParametricGeometry(parametricFunction, 20, 20);
    const material = new THREE.MeshBasicMaterial({ color: 0x00FF00, wireframe: true });
    const para = new THREE.Mesh(geometry, material);
    para.scale.multiplyScalar(s);
    parametric.position.set(x, y, z);
    parametric.add(para);
    obj.add(parametric);
}

// Parametric functions -------------------------------------------------------------------------------------------
function mobiusStrip(u, t, target) {
    u = u - 0.5;
    const v = 2 * Math.PI * t;
    const a = 2;

    const x = Math.cos( v ) * ( a + u * Math.cos( v / 2 ) );
    const y = Math.sin( v ) * ( a + u * Math.cos( v / 2 ) );
    const z = u * Math.sin( v / 2 );

    target.set( x, y, z );
}

function cylinderHollow(u, t, target) {
    u -= 0.5;
    const v = 2 * Math.PI * t;

    const x = Math.cos(v)/2;
    const y = u;
    const z = Math.sin(v)/2;

    target.set( x, y, z );
}

function coneNoBase(u, t, target) {
    const v = 2 * Math.PI * t;

    const x = u/3*Math.cos(v) - u/2*Math.sin(v);
    const y = -u + 0.5;
    const z = u/3*Math.sin(v) + u/2*Math.cos(v);

    target.set( x, y, z );
}

function hyperboloid(u, t, target) {
    u -= 0.5;
    const v = 2 * Math.PI * t;

    const x = 0.75*u*Math.cos(v) - 0.25*Math.sin(v);
    const y = -u;
    const z = 0.75*u*Math.sin(v) + 0.25*Math.cos(v);

    target.set( x, y, z );
}

function coneNoTopNoBase(u, t, target) {
    u += 0.2;
    const v = 2 * Math.PI * t;

    const x = 0.8*u/3*Math.cos(v) - 0.8*u/2*Math.sin(v);
    const y = -u + 0.7;
    const z = 0.8*u/3*Math.sin(v) + 0.8*u/2*Math.cos(v);

    target.set( x, y, z );
}

function irregularTiltedCone(u, t, target) {
    const v = 2 * Math.PI * t;

    const x = -0.2 + 1/8*u*(3 + 2*Math.sin(v) + Math.cos(2*v));
    const y = -u + 0.5;
    const z = 1/12*u*(4*Math.cos(v) - Math.sin(2*v));

    target.set( x, y, z );
}

function irregularCylinder(u, t, target) {
    u -= 0.5;
    const v = 2 * Math.PI * t;

    const x = 1/8*(3 + 2*Math.sin(v) + Math.cos(2*v)) - 1/4;
    const y = u/1.65;
    const z = 1/12*(4*Math.cos(v) - Math.sin(2*v));

    target.set( x, y, z );
}

function irregularTiltedCylinder(u, t, target) {
    u -= 0.5;
    const v = 2 * Math.PI * t;

    const x = -u/4 + 1/8*(3 + 2*Math.sin(v) + Math.cos(2*v)) - 1/4;
    const y = u/1.65;
    const z = -u/5 + 1/12*(4*Math.cos(v) - Math.sin(2*v));

    target.set( x, y, z );
}

function twistedPlane(u, t, target) {
    u -= 0.5;
    const v = Math.PI/2 * t;

    const x = u/2*(1 + Math.cos(v));
    const y = u/2*(1 + Math.sin(v));
    const z = v - 0.75;

    target.set( x, y, z );
}

// Carousel creation functions ------------------------------------------------------------------------------------
//PARAMETRIC OBJECTS
function createMobiusStrip(obj) {
    mobius = new THREE.Object3D();
    mobius.userData = { step: -Math.PI/2 };
    var geometry = new ParametricGeometry(mobiusStrip, 20, 20);
    var material = new THREE.MeshBasicMaterial({ color: 0xff9100, wireframe: true });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.scale.multiplyScalar(1);
    mesh.position.y = 2.75;
    mobius.add(mesh);
    obj.add(mobius);
}

function createParametricObjects(ring, radius) {
    const scalarDefault = 5;
    const functions = [
        cylinderHollow,
        irregularCylinder,
        irregularTiltedCylinder,
        coneNoBase,
        coneNoTopNoBase,
        irregularTiltedCone,
        hyperboloid,
        twistedPlane
    ];

    const positionsY = [1.5, 1.5, 1.5, 1.75, 1.75, 2, 2, 1.5];
    const scalars = [
        3, 5, scalarDefault, 3.5, 
        3.5, 4, 4, 3];

    for (let i = 0; i < 8; i++) {
        const pos_x = radius * Math.cos(i * Math.PI / 4);
        const pos_z = radius * Math.sin(i * Math.PI / 4);
        const pos_y = positionsY[i];
        const scalar = scalars[i];
        const func = functions[i];

        buildParametric(ring, pos_x, pos_y, pos_z, func, scalar);
    }
}

//RINGS
function createRings(x, y, z) {
    rings = new THREE.Object3D();
    innerRing = new THREE.Object3D();
    midRing = new THREE.Object3D();
    outerRing = new THREE.Object3D();
    
    buildRing(outerRing, 20 , 15, 5, x, y, z, 0xFFFF00);
    buildRing(midRing, 15, 10, 5, x, y, z, 0x00FFFF);
    buildRing(innerRing, 10, 5, 5, x, y, z, 0xFF00FF);
    createParametricObjects(outerRing, 17.5);
    createParametricObjects(midRing, 12.5);
    createParametricObjects(innerRing, 7.5);

    midRing.add(outerRing);
    innerRing.add(midRing);
    rings.add(innerRing);
    carousel.add(rings);
    rings.position.set(x, y, z);

    
}

//CENTER DISK
function createDisk(x, y, z) {
    center_disk = new THREE.Object3D();
    buildCylinder(center_disk, x, y, z, 5, 5, 5, 0x00FF00);
    createMobiusStrip(center_disk);
    carousel.add(center_disk);
}


//CAROUSEL
function createCarousel(x, y, z) {
    carousel = new THREE.Object3D();
    createRings(0, 0, 0);
    createDisk(0, -2.5, 0);

    carousel.position.set(x, y, z);
    scene.add(carousel);    
}


//SKYDOME
function createSkydome(x, y, z) {
    const radius = 100;
    const widthSegments = 32;
    const heightSegments = 32;
    const phiStart = 0;
    const phiLength = Math.PI * 2;
    const thetaStart = 0;
    const thetaLength = Math.PI / 2; // Half sphere

    const skyGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength);
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('../OskarFischinger.png'); // Replace 'path/to/your/image.jpg' with the actual path to your image
    texture.repeat.set(8, 4); // Repeat the texture 4 times in both directions
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    const skyMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide, wireframe: wireframe});
    const skydome = new THREE.Mesh(skyGeometry, skyMaterial);
    skydome.position.set(x, y, z); // Set the position of the skydome
    scene.add(skydome);
}

//GROUND
function createGround(x, y, z) {
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x0000FF, side: THREE.DoubleSide, wireframe: wireframe});
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = Math.PI / 2 ; // Rotate the ground to be horizontal
    ground.position.set(x, y, z); // Set the position of the ground
    scene.add(ground);
}


// Function to create scene ------------------------------------------------------------------------------------------
function createScene() {
    'use strict';
    scene = new THREE.Scene();
    scene.add(new THREE.AxesHelper(10));
    createSkydome(0, -20, 0);
    createGround(0, -20, 0);
    createCarousel(0, 0, 0);
}


// Function to create cameras
function createCameras() {
    'use strict';
    var left = window.innerWidth / -28; 
    var right = window.innerWidth / 28; 
    var top = window.innerHeight / 28; 
    var bottom = window.innerHeight / -28; 
    var near = 1; 
    var far = 2000; 

    camera1= new THREE.OrthographicCamera(left, right, top, bottom, near, far);
    camera1.position.set(0, 10, 100); 
    camera1.lookAt(0, 10, 0);

    camera2= new THREE.OrthographicCamera(left, right, top, bottom, near, far);
    camera2.position.set(100, 10, 0); 
    camera2.lookAt(0, 10, 0);

    camera3= new THREE.OrthographicCamera(left, right, top, bottom, near, far);
    camera3.position.set(0, 100, 0); 
    camera3.lookAt(0, 0, 0);

    camera4 = new THREE.OrthographicCamera(left-10, right+10, top+10, bottom-10, near, far);
    camera4.position.set(30, 30, 30);
    camera4.lookAt(0, 0, 0);

    camera5 = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 1000);
    camera5.position.set(30, 30, 30);
    camera5.lookAt(0, 0, 0);

    camera6 = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 1000);
    camera6.position.set(0, -1, 0);  // Set initial position, adjust as needed
    camera6.lookAt(0, -15, 0);
    camera6.rotation.z = Math.PI;

    cameras.push(camera1);
    cameras.push(camera2);
    cameras.push(camera3);
    cameras.push(camera4);
    cameras.push(camera5);
    cameras.push(camera6);

    activeCameraNumber = 1; 
}

// Function to handle key presses
function onKeyUp(e) {
    'use strict';
    switch (e.keyCode) {
        //CAMERA Switching 
        case 49:    // '1' key
            innerRing_animation = false; 
            break;
        case 50:    // '2' key
            midRing_animation = false;
            break;
        case 51:    // '3' key
            outerRing_animation = false;
        
    }

}

// Function to handle key presses
function onKeyDown(e) {
    'use strict';
    switch (e.keyCode) {
        case 49:    // '1' key
            innerRing_animation = true; 
            break;
        case 50:    // '2' key
            midRing_animation = true;
            break;
        case 51:    // '3' key
            outerRing_animation = true;
            break;
        //CAMERA Switching 
        case 52:    // '4' key
            activeCameraNumber = 1; 
            break;
        case 53:    // '5' key
            activeCameraNumber = 2;
            break;
        case 54:    // '6' key
            activeCameraNumber = 3;
            break;
        case 55:    // '7' key
            activeCameraNumber = 4;
            break;
        case 56:    // '8' key
            activeCameraNumber = 5;
            break;
        // WIREFRAME activation
        case 57:    // '9' key
            scene.traverse(function (node) {
                if (node instanceof THREE.Mesh) {
                    node.material.wireframe = !node.material.wireframe;
                }
            });
            wireframe = !wireframe;
            break;
    
        }
}

// Function to resize the window
function onResize() {
    // Update renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Update camera aspect ratio
    const aspect = window.innerWidth / window.innerHeight;
    var camera = cameras[activeCameraNumber - 1];

    // For orthographic cameras
    if (camera instanceof THREE.OrthographicCamera) {
        // Calculate the new dimensions of the orthographic camera
        const frustumHeight = camera.top - camera.bottom;
        const frustumWidth = frustumHeight * aspect;

        // Set new camera dimensions
        camera.left = -frustumWidth / 2;
        camera.right = frustumWidth / 2;
        camera.top = frustumHeight / 2;
        camera.bottom = -frustumHeight / 2;
    } 
    // For perspective cameras
    else if (camera instanceof THREE.PerspectiveCamera) {
        // Update camera aspect ratio
        camera.aspect = aspect;
}

    // Update camera projection matrix
    camera.updateProjectionMatrix();
}


// Function to render the scene
function render() {
    'use strict';
    renderer.render(scene, cameras[activeCameraNumber - 1]);
}

// Function to initialize the scene, camera, and renderer
function init() {
    'use strict';
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    renderer.setClearColor(0x000000, 0); // Set clear color to transparent
    console.log("Renderer initialized:", renderer);

    createCameras(); // Create the camera
    createScene(); // Create the scene
    // Highlight the active camera and wireframe initially
    // updateHUD('', true, activeCameraNumber); // Highlight the active camera
    document.addEventListener("keydown", onKeyDown); // Add event listener for key presses
    document.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize);
}

function mobius_animate(deltaTime) {
    mobius.userData.step += 1.5 * deltaTime;
    mobius.position.y = 1 * (Math.sin(mobius.userData.step) + 1);
}

function parametric_animate(deltaTime) {
    const listRings = [innerRing, midRing, outerRing];
    innerRing.children[1].rotation.y += 1 * deltaTime;


    for (var i=1; i<9; i++) {
        innerRing.children[i].rotation.x = Math.PI/4 * Math.cos(paramUp);
        innerRing.children[i].rotation.z = Math.PI/4 * Math.sin(paramUp);
    }
}

// Function to initialize the scene, camera, and renderer
function outerRing_animate(deltaTime) {
    if (upOuter) outerRing.position.y += MOVEMENT_SPEED * deltaTime;
    else outerRing.position.y -= MOVEMENT_SPEED * deltaTime;
    const outerRingWorldPosition = new THREE.Vector3();
    outerRing.getWorldPosition(outerRingWorldPosition);
    const midRingWorldPosition = new THREE.Vector3();
    midRing.getWorldPosition(midRingWorldPosition);

    if (outerRingWorldPosition.y >= midRingWorldPosition.y + 5)
        upOuter = false;
    else if (outerRingWorldPosition.y <= midRingWorldPosition.y - 5)
        upOuter = true;
}

function midRing_animate(deltaTime) {
    if (upMid) midRing.position.y += MOVEMENT_SPEED * deltaTime;
    else midRing.position.y -= MOVEMENT_SPEED * deltaTime;
    const midRingWorldPosition = new THREE.Vector3();
    midRing.getWorldPosition(midRingWorldPosition);
    const innerRingWorldPosition = new THREE.Vector3();
    innerRing.getWorldPosition(innerRingWorldPosition);

    if (midRingWorldPosition.y >= innerRingWorldPosition.y + 5)
        upMid = false;
    else if (midRingWorldPosition.y <= innerRingWorldPosition.y - 5)
        upMid = true;
}

function innerRing_animate(deltaTime) {
    if (upInner) innerRing.position.y += MOVEMENT_SPEED * deltaTime;
    else innerRing.position.y -= MOVEMENT_SPEED * deltaTime;
    const innerRingWorldPosition = new THREE.Vector3();
    innerRing.getWorldPosition(innerRingWorldPosition);
    const cdiskWorldPosition = new THREE.Vector3();
    center_disk.getWorldPosition(cdiskWorldPosition);

    if (innerRingWorldPosition.y >= cdiskWorldPosition.y + 5)
        upInner = false;
    else if (innerRingWorldPosition.y <= cdiskWorldPosition.y - 5)
        upInner = true;
    }

function carousel_movement(deltaTime) {
    if (innerRing_animation) innerRing_animate(deltaTime);
    if (midRing_animation) midRing_animate(deltaTime);
    if (outerRing_animation) outerRing_animate(deltaTime);

    innerRing.rotation.y += ROTATION_SPEED * deltaTime;
    midRing.rotation.y -= (2 * ROTATION_SPEED) * deltaTime;
    outerRing.rotation.y += (2 * ROTATION_SPEED) * deltaTime;

    center_disk.rotation.y -= ROTATION_SPEED * deltaTime;
    
}

function animate() {
    'use strict';
    const deltaTime = clock.getDelta();

    requestAnimationFrame(animate);
    carousel_movement(deltaTime);
    mobius_animate(deltaTime);

    render();
}

// Initialize the scene
init();
animate();