/**
 * Authors:
 *  - João Fidalgo, ist1103471
 *  - Tomás Cruz, ist1103425
 *  - Rodrigo Friães, ist1104139
 * Work time estimate per collaborator: 20h
 */

import * as THREE from 'three';
var scene, renderer;

//RINGS
var rings, ring1, ring2, ring3, center_disk;
var ring1_animation = false;
var ring2_animation = false;
var ring3_animation = false;

var up1 = true, up2 = true, up3 = true;


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

function createRings(x, y, z) {
    rings = new THREE.Object3D();
    ring1 = new THREE.Object3D();
    ring2 = new THREE.Object3D();
    ring3 = new THREE.Object3D();
    
    buildRing(ring3, 20, 15, 5, x, y, z, 0xFFFF00);
    buildRing(ring2, 15, 10, 5, x, y, z, 0x00FFFF);
    buildRing(ring1, 10, 5, 5, x, y, z, 0xFF00FF);
    // buildCylinder(carousel, 0, 12.5, 0, 5, 5, 5, 0x00FF00);

    ring2.add(ring3);
    ring1.add(ring2);
    rings.add(ring1);
    scene.add(rings);
    rings.position.set(x, y, z);

    
}

function createDisk(x, y, z) {
    center_disk = new THREE.Object3D();
    buildCylinder(center_disk, x, y, z, 5, 5, 5, 0x00FF00);
    scene.add(center_disk);

}

//CAROUSEL
function createCarousel(x, y, z) {
    var carousel = new THREE.Object3D();
    carousel.position.set(x, y, z);
    scene.add(carousel);
    createRings(0, 0, 0);
    createDisk(0, -2.5, 0);

    
}



//GROUND
function createGround() {
    var ground = new THREE.Mesh(new THREE.BoxGeometry(50, 50, 3).rotateX(-Math.PI * 0.5), new THREE.MeshBasicMaterial({color: new THREE.Color(0x875280).multiplyScalar(1.5), wireframe: wireframe}));
    ground.position.set(0, -1.5, 0);
    scene.add(ground);
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
            ring1_animation = false; 
            break;
        case 50:    // '2' key
            ring2_animation = false;
            break;
        case 51:    // '3' key
            ring3_animation = false;
        
    }

}



// Function to handle key presses
function onKeyDown(e) {
    'use strict';
    switch (e.keyCode) {
        case 49:    // '1' key
            ring1_animation = true; 
            break;
        case 50:    // '2' key
            ring2_animation = true;
            break;
        case 51:    // '3' key
            ring3_animation = true;
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

// Function to initialize the scene, camera, and renderer
function ring3_animate(deltaTime) {
    if (up3) ring3.position.y += MOVEMENT_SPEED * deltaTime;
    else ring3.position.y -= MOVEMENT_SPEED * deltaTime;
    const ring3WorldPosition = new THREE.Vector3();
    ring3.getWorldPosition(ring3WorldPosition);
    const ring2WorldPosition = new THREE.Vector3();
    ring2.getWorldPosition(ring2WorldPosition);

    if (ring3WorldPosition.y >= ring2WorldPosition.y + 5)
        up3 = false;
    else if (ring3WorldPosition.y <= ring2WorldPosition.y - 5)
        up3 = true;
}

function ring2_animate(deltaTime) {
    if (up2) ring2.position.y += MOVEMENT_SPEED * deltaTime;
    else ring2.position.y -= MOVEMENT_SPEED * deltaTime;
    const ring2WorldPosition = new THREE.Vector3();
    ring2.getWorldPosition(ring2WorldPosition);
    const ring1WorldPosition = new THREE.Vector3();
    ring1.getWorldPosition(ring1WorldPosition);

    if (ring2WorldPosition.y >= ring1WorldPosition.y + 5)
        up2 = false;
    else if (ring2WorldPosition.y <= ring1WorldPosition.y - 5)
        up2 = true;
}

function ring1_animate(deltaTime) {
    if (up1) ring1.position.y += MOVEMENT_SPEED * deltaTime;
    else ring1.position.y -= MOVEMENT_SPEED * deltaTime;
    const ring1WorldPosition = new THREE.Vector3();
    ring1.getWorldPosition(ring1WorldPosition);
    const cdiskWorldPosition = new THREE.Vector3();
    center_disk.getWorldPosition(cdiskWorldPosition);

    if (ring1WorldPosition.y >= cdiskWorldPosition.y + 5)
        up1 = false;
    else if (ring1WorldPosition.y <= cdiskWorldPosition.y - 5)
        up1 = true;
    }

function carousel_movement(deltaTime) {
    if (ring1_animation) ring1_animate(deltaTime);
    if (ring2_animation) ring2_animate(deltaTime);
    if (ring3_animation) ring3_animate(deltaTime);
    rings.rotation.y += ROTATION_SPEED * deltaTime;
    center_disk.rotation.y += ROTATION_SPEED * deltaTime;
    
}


/*function JibAnimation(deltaTime) {
    if (rotateLeft) { // Rotate left [NO LIMIT]
        topStruct.rotation.y -= ROTATION_SPEED * deltaTime;
    }
    if (rotateRight) { // Rotate right [NO LIMIT]
        topStruct.rotation.y += ROTATION_SPEED * deltaTime;
    }
}

function hookAnimation(deltaTime) {
    if (moveDown && hook.position.y > MIN_HEIGHT && !blocked) {  // Move down
        hook.position.y -= MOVEMENT_SPEED * deltaTime;
        const scaleChangeFactor = MOVEMENT_SPEED / 14;
        hook.children[0].scale.y += scaleChangeFactor * deltaTime;
        hook.children[0].position.y += ((14 * scaleChangeFactor) / 2) * deltaTime;
    }
    if (moveUp && hook.position.y < MAX_HEIGHT) { // Move up
        hook.position.y += MOVEMENT_SPEED * deltaTime;
        const scaleChangeFactor = MOVEMENT_SPEED / 14;
        hook.children[0].scale.y -= scaleChangeFactor * deltaTime;
        hook.children[0].position.y -= ((14 * scaleChangeFactor) / 2) * deltaTime;
    }
}

function kartAnimation(deltaTime) {
    if (moveBackward && kart.position.z > MIN_SLIDE) { // Move backward
        kart.position.z -= MOVEMENT_SPEED * deltaTime;
    }
    if (moveForward && kart.position.z < MAX_SLIDE) { // Move forward
        kart.position.z += MOVEMENT_SPEED * deltaTime;
    }
}

function clawsAnimation(deltaTime) {
    if (openClaws && -claws.children[0].rotation.x < MAX_CLAW_OPENING) { // Open claws
        claws.children[0].rotation.x -= CLAW_SPEED * deltaTime;
        claws.children[1].rotation.x += CLAW_SPEED * deltaTime; 
        claws.children[2].rotation.z += CLAW_SPEED * deltaTime; 
        claws.children[3].rotation.z -= CLAW_SPEED * deltaTime; 
    }

    if (closeClaws && -claws.children[0].rotation.x > MIN_CLAW_OPENING) {   // Close claws
        claws.children[0].rotation.x += CLAW_SPEED * deltaTime; 
        claws.children[1].rotation.x -= CLAW_SPEED * deltaTime; 
        claws.children[2].rotation.z -= CLAW_SPEED * deltaTime; 
        claws.children[3].rotation.z += CLAW_SPEED * deltaTime;  
    }
}


//Release object animation -----------------------------------------------------------------------------------------
function moveObjectClaws(deltaTime) {
    if (-claws.children[0].rotation.x < MAX_CLAW_OPENING) { // Open claws
        claws.children[0].rotation.x -= CLAW_SPEED * deltaTime;
        claws.children[1].rotation.x += CLAW_SPEED * deltaTime; 
        claws.children[2].rotation.z += CLAW_SPEED * deltaTime; 
        claws.children[3].rotation.z -= CLAW_SPEED * deltaTime; 
        return false;
    }
    return true;
}

function moveObjectHook(deltaTime){
    if(hook.position.y < -10) { // Move up
        hook.position.y += MOVEMENT_SPEED * deltaTime;
        const scaleChangeFactor = MOVEMENT_SPEED / 14;
        hook.children[0].scale.y -= scaleChangeFactor * deltaTime;
        hook.children[0].position.y -= ((14 * scaleChangeFactor) / 2) * deltaTime;
        return false;
    } 
    return true;
}

function moveObjectKart(deltaTime) {
    var kartFinalPos = Math.sqrt(Math.pow(crate.position.x, 2) + 
        Math.pow(crate.position.z, 2));

    const threshold = 0.05; // Adjust this threshold as needed

    const roundedKartPos = Math.round(kart.position.z * 100) / 100;
    const roundedFinalPos = Math.round(kartFinalPos * 100) / 100;

    if (Math.abs(roundedKartPos - roundedFinalPos) > threshold) {
        if (kart.position.z > kartFinalPos) { // Move backward
            kart.position.z -= MOVEMENT_SPEED * deltaTime;
        }
        if (kart.position.z < kartFinalPos) {  // Move forward
            kart.position.z += MOVEMENT_SPEED * deltaTime;
        }
        return false;
    } 
    return true;
}

function moveObjectJib(deltaTime) {
    const angleToCrate = Math.atan2(crate.position.x, crate.position.z);
    const normalizedRotation = (topStruct.rotation.y % (2 * Math.PI) + (2 * Math.PI)) % (2 * Math.PI);

    let shortestAngle = angleToCrate - normalizedRotation;
    if (shortestAngle > Math.PI) {
        shortestAngle -= 2 * Math.PI;
    } else if (shortestAngle < -Math.PI) {
        shortestAngle += 2 * Math.PI;
    }

    let rotationDirection = Math.sign(shortestAngle);

    if (Math.abs(shortestAngle) > ROTATION_SPEED * deltaTime) {
        topStruct.rotation.y += rotationDirection * ROTATION_SPEED * deltaTime; //Rotate if the rotation is bigger than the rotation step
        return false;
    } else {
        topStruct.rotation.y = angleToCrate; // Keeps the position static if the rotation is too little (lower than the rotation step)
        return true;
    }
}

function releaseObject(deltaTime) {
    var minY = caughtObject.height + 0.25; 
    if(caughtObject.position.y > minY) {
        if (caughtObject.position.y - fallingSpeed * deltaTime <= minY) 
            caughtObject.position.y -= caughtObject.position.y - minY;         
        else caughtObject.position.y -= fallingSpeed * deltaTime;
        fallingSpeed *= 1.1;
    } else {
        scene.remove(caughtObject);
        release = false;
        fallingSpeed = MOVEMENT_SPEED;
    }

}

function moveObject(deltaTime) {
    if (moveObjectHook(deltaTime)) {
        var kartCond = moveObjectKart(deltaTime);
        var jibCond = moveObjectJib(deltaTime);

        if(kartCond && jibCond) {
            if(moveObjectClaws(deltaTime)){
                objectCaught = false;
            }    
        }
    }

    if (readyForRelease) {
        var worldRotation = new THREE.Quaternion();
        caughtObject.getWorldQuaternion(worldRotation);
        // Remove the object from the hook
        hook.remove(caughtObject);

        var worldPosition = new THREE.Vector3();
        hook.getWorldPosition(worldPosition);

        caughtObject.position.copy(worldPosition);

        // hook_box_height/2 + object_hb_radius + hook_top_hb_radius  
        caughtObject.position.y -= 1 + caughtObject.children[1].geometry.parameters.radius + 0.5; 

        scene.add(caughtObject);
        caughtObject.setRotationFromQuaternion(worldRotation);
        
        readyForRelease = false;
        release = true;
    }

    if (release) releaseObject(deltaTime);
}*/


function animate() {
    'use strict';
    const deltaTime = clock.getDelta();

    requestAnimationFrame(animate);
    carousel_movement(deltaTime);

    render();
}

// Initialize the scene
init();
animate();