/**
 * Authors:
 *  - João Fidalgo, ist1103471
 *  - Tomás Cruz, ist1103425
 *  - Rodrigo Friães, ist1104139
 * Work time estimate per collaborator: 20h
 */

import * as THREE from 'three';
//import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
var scene, renderer;

//RINGS
var carousel;
var innerRing_movement = false;
var midRing_movement = false;
var outerRing_movement = false;

// Cameras
var activeCameraNumber, camera1, camera2, camera3, camera4, camera5, camera6;

// Objects visibility
var wireframe = true;

// Graphic's clock 
const clock = new THREE.Clock();

// Movement constant variables
const ROTATION_SPEED = 0.35;
const MOVEMENT_SPEED = 5;
const CLAW_SPEED = 0.6;

// Define cameras array
var cameras = [];


// Builder functions ----------------------------------------------------------------------------------------------
function buildCylinder(obj, x, y, z, height, radiusTop, radiusBottom, color) {
    'use strict';
    var geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 50);
    var material = new THREE.MeshBasicMaterial({ color: color, wireframe: wireframe })
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function buildRing(obj, innerRadius, outerRadius, height, x, y, z, color) {
    'use strict';

    var shape = new THREE.Shape();
    shape.absarc(0, 0, innerRadius, 0, Math.PI * 2, false); // Use innerRadius here
    var holePath = new THREE.Path();
    holePath.absarc(0, 0, outerRadius, 0, Math.PI * 2, true); // Use outerRadius here
    shape.holes.push(holePath);

    var extrudeSettings = {
        steps: 1,
        depth: height,
        bevelEnabled: false
    };

    var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    var material = new THREE.MeshBasicMaterial({ color: color, wireframe: wireframe });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.set(x, y, z);
    obj.add(mesh);
}


// Carousel creation functions ----------------------------------------------------------------------------------
function createInnerRing(obj) {
    var innerRing = new THREE.Object3D();
    innerRing.userData = { step: -Math.PI/2 };
    buildRing(innerRing, 20, 15, 5, 0, 0, 0, 0xFFFF00);
    obj.add(innerRing);
}

function createMidRing(obj) {
    var midRing = new THREE.Object3D();
    midRing.userData = { step: -Math.PI/2 };
    buildRing(midRing, 15, 10, 5, 0, 0, 0, 0x00FFFF);
    obj.add(midRing);
}

function createOuterRing(obj) {
    var outerRing = new THREE.Object3D();
    outerRing.userData = { step: -Math.PI/2 };
    buildRing(outerRing, 10, 5, 5, 0, 0, 0, 0xFF00FF);
    obj.add(outerRing);
}

function createDisks(obj) {
    var center_disk = new THREE.Object3D();

    createInnerRing(center_disk);
    createMidRing(center_disk);
    createOuterRing(center_disk);

    buildCylinder(center_disk, 0, -2.5, 0, 5, 5, 5, 0x00FF00);

    obj.add(center_disk);
}

//CAROUSEL
function createCarousel(x, y, z) {
    carousel = new THREE.Object3D();

    createDisks(carousel);

    carousel.position.set(x, y, z);
    scene.add(carousel);
}


// Function to create scene ------------------------------------------------------------------------------------------
function createScene() {
    'use strict';
    scene = new THREE.Scene();
    scene.add(new THREE.AxesHelper(10));
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

    activeCameraNumber = 5; 
}

// Function to handle key presses
function onKeyUp(e) {
    'use strict';
    switch (e.keyCode) {
        //CAMERA Switching 
        case 49:    // '1' key
            innerRing_movement = false; 
            break;
        case 50:    // '2' key
            midRing_movement = false;
            break;
        case 51:    // '3' key
            outerRing_movement = false;
        
    }

}



// Function to handle key presses
function onKeyDown(e) {
    'use strict';
    switch (e.keyCode) {
        case 49:    // '1' key
            innerRing_movement = true; 
            break;
        case 50:    // '2' key
            midRing_movement = true;
            break;
        case 51:    // '3' key
            outerRing_movement = true;
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


// Functions to animate the scene --------------------------------------------------------------------------------
function innerRing_animate(deltaTime) {
    const innerRing = carousel.children[0].children[0];
    if (innerRing_movement) {
        innerRing.userData.step += 0.75 * deltaTime;
        innerRing.position.y = Math.abs(7.5 * (Math.sin(innerRing.userData.step) + 1));
    }
}

function midRing_animate(deltaTime) {
    const midRing = carousel.children[0].children[1];
    if (midRing_movement) {
        midRing.userData.step += 0.75 * deltaTime;
        midRing.position.y = Math.abs(7.5 * (Math.sin(midRing.userData.step) + 1));
    }
}

function outerRing_animate(deltaTime) {
    const outerRing = carousel.children[0].children[2];
    if (outerRing_movement) {
        outerRing.userData.step += 0.75 * deltaTime;
        outerRing.position.y = Math.abs(7.5 * (Math.sin(outerRing.userData.step) + 1));
    }
}

function carousel_movement(deltaTime) {
    innerRing_animate(deltaTime);
    midRing_animate(deltaTime);
    outerRing_animate(deltaTime);

    carousel.rotation.y += ROTATION_SPEED*deltaTime;    
}


function animate() {
    'use strict';
    const deltaTime = clock.getDelta();
    carousel_movement(deltaTime);

    render();
    requestAnimationFrame(animate);
}

// Initialize the scene
init();
animate();