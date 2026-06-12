import * as THREE from "three";

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
let scene, renderer;
var geometry, mesh;
var robot;
var trailer;

var cameras = [];
var currentCamera = 0;
var materials = [];

let keyStates = {
    "Q": false,
    "A": false,
    "W": false,
    "S": false,
    "E": false,
    "D": false,
    "R": false,
    "F": false,
    "LEFT": false,
    "BACK": false,
    "RIGHT": false,
    "FRONT": false
};

// For trailer animation
let trailerTargetPosition = null;
let isAnimatingTrailer = false;
const trailerReturnSpeed = 0.2;

///////////////////////////////////////////////////////
/*                    TASK 1                         */
///////////////////////////////////////////////////////


/////////////////////
/*  CREATE SCENE   */
/////////////////////

function createScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFFF8DC);
    createRobot();
    createTrailer();
}

//////////////////////
/*  CREATE CAMERAS  */
//////////////////////

function createCamera() {
    const aspect = window.innerWidth / window.innerHeight;
    const viewSize = 30; // Half-height of the view

    // Camera frontal
    const cameraFrontal = new THREE.OrthographicCamera(-aspect * viewSize, aspect * viewSize, viewSize, -viewSize, 1, 1000);
    cameraFrontal.position.set(0, 0, 900);
    cameraFrontal.lookAt(scene.position);
    cameras.push(cameraFrontal);

    // Camera lateral
    const cameraLateral = new THREE.OrthographicCamera(-aspect * viewSize, aspect * viewSize, viewSize, -viewSize, 1, 1000);
    cameraLateral.position.set(-500, 0, 0);
    cameraLateral.lookAt(scene.position);
    cameras.push(cameraLateral);

    // Camera de topo
    const cameraTopo = new THREE.OrthographicCamera(-aspect * viewSize, aspect * viewSize, viewSize, -viewSize, 1, 1000);
    cameraTopo.position.set(0, 500, 0);
    cameraTopo.lookAt(scene.position);
    cameras.push(cameraTopo);

    // Camera isometrica (projecao perspectiva)
    const cameraPerspectiva = new THREE.PerspectiveCamera(45, aspect, 1, 5000);
    cameraPerspectiva.position.set(40, 25, 40);
    cameraPerspectiva.lookAt(scene.position);
    cameras.push(cameraPerspectiva);
}


//////////////////////
/*  CHANGE CAMERAS  */
//////////////////////

function changeCamera(index) {
    if (index >= 0 && index < cameras.length) {
        currentCamera = index;
        cameras[currentCamera].updateProjectionMatrix();  // Question: i dont know this funtion
    }
}

///////////////////////////////////////////////////////
/*                    TASK 2 & 3                     */
///////////////////////////////////////////////////////


///////////////////////////////////////////////////
/* Define colors for the components of the robot */
///////////////////////////////////////////////////

// colors
function createMaterials() {
    //head - 0
    materials.push(new THREE.MeshBasicMaterial({ color: 0xddd6ca, wireframe: false }));

    //eyes and antenas - 1
    materials.push(new THREE.MeshBasicMaterial({ color: 0xff8a3d, wireframe: false }));

    //forearm and pipe - 2
    materials.push(new THREE.MeshBasicMaterial({ color: 0x9fbcc2, wireframe: false }));

    //arms - 3
    materials.push(new THREE.MeshBasicMaterial({ color: 0xcedcdce, wireframe: false }));

    //legs - 4
    materials.push(new THREE.MeshBasicMaterial({ color: 0x9fbcc2, wireframe: false }));

    //abdomen - 5
    materials.push(new THREE.MeshBasicMaterial({ color: 0xeedfda, wireframe: false }));

    //waist - 6
    materials.push(new THREE.MeshBasicMaterial({ color: 0x9791a0, wireframe: false }));

    //wheels - 7
    materials.push(new THREE.MeshBasicMaterial({ color: 0x766d6d, wireframe: false }));

    //feet - 8
    materials.push(new THREE.MeshBasicMaterial({ color: 0xddd6ca, wireframe: false }));

    //thigh and trailer piece - 9
    materials.push(new THREE.MeshBasicMaterial({ color: 0xddd6ca, wireframe: false }));

    //body and back - 10
    materials.push(new THREE.MeshBasicMaterial({ color: 0xeedfda, wireframe: false }));

    //trailer - 11
    materials.push(new THREE.MeshBasicMaterial({ color: 0xefe0b2, wireframe: false }));

}

/////////////////////////////////////////////////////////
/* Create components for the construction of the robot */
/////////////////////////////////////////////////////////

function createRobot() {
  robot = new THREE.Object3D();
  robot.name = 'robot';

  createLegs(robot);
  createArm(robot, true);
  createArm(robot, false);
  createWaist(robot);
  createAbdomen(robot);
  createHead(robot);
  createBody(robot);
  scene.add(robot);
}

function createBody(obj) {

  var body = new THREE.Object3D();
  body.name = 'body';

  geometry = new THREE.BoxGeometry(bodyLength, bodyHeight, bodyWidth);
  mesh = new THREE.Mesh(geometry, materials[10]);
  body.add(mesh);

  geometry = new THREE.BoxGeometry(backLength, backHeight, backWidth);
  mesh = new THREE.Mesh(geometry, materials[10]);
  mesh.position.set(0, 0, -bodyWidth/2 - backWidth/2);
  body.add(mesh);

  obj.add(body);
}

function createHead(obj) {
  var head = new THREE.Object3D();
  head.name = 'head';

  geometry = new THREE.BoxGeometry(headEdgeLength, headEdgeLength, headEdgeLength);
  mesh = new THREE.Mesh(geometry, materials[0]);
  mesh.position.y += headEdgeLength/2;

  head.add(mesh);

  createEye(head, -headEdgeLength/4, headEdgeLength/2, headEdgeLength/2, false);
  createEye(head, headEdgeLength/4, headEdgeLength/2, headEdgeLength/2, false);
  createAntena(head, -headEdgeLength/4, headEdgeLength/2 + antenaHeight/2 + headEdgeLength/2, 0, false);
  createAntena(head, headEdgeLength/4, headEdgeLength/2 + antenaHeight/2 + headEdgeLength/2, 0, false);

  head.position.y += bodyHeight/2;

  obj.add(head);
}

function createAntena(obj, x, y, z, isRight){
  geometry = new THREE.ConeGeometry(antenaRadius, antenaHeight, 15);
  mesh = new THREE.Mesh(geometry, materials[1]);
  mesh.name = isRight ? 'right antena' : 'left antena';
  mesh.position.set(x, y, z);
  obj.add(mesh);
}

function createEye(obj, x, y, z, isRight){
  geometry = new THREE.SphereGeometry(eyeRadius, 32, 15);
  mesh = new THREE.Mesh(geometry, materials[1]);
  mesh.name = isRight ? 'right eye' : 'left eye';
  mesh.position.set(x, y, z);
  obj.add(mesh);
}

function createArm(obj, isRight){
  var arm = new THREE.Object3D();
  arm.name = isRight ? 'right arm' : 'left arm';
  
  var pipe_x = isRight ? (armLength/2 + pipeRadius/2) : (-armLength/2 - pipeRadius/2);

  geometry = new THREE.BoxGeometry(armLength, armHeight, armWidth);
  mesh = new THREE.Mesh(geometry, materials[3]);
  arm.add(mesh);

  createForearm(arm, 0, - armHeight/2 - forearmHeight/2, forearmLength/2 + armLength/2, isRight);
  createPipe(arm, pipe_x , armHeight/3, 0, isRight);

  arm.position.x = isRight ? bodyLength/2 + armLength/2 : -bodyLength/2 - armLength/2;
  arm.position.z = -bodyWidth/2 - armWidth/2
  
  obj.add(arm);
}

function createPipe(obj, x, y, z, isRight) {
  geometry = new THREE.CylinderGeometry(pipeRadius, pipeRadius, pipeHeight, 15);
  mesh = new THREE.Mesh(geometry, materials[2]);

  mesh.name = isRight ? 'right pipe' : 'left pipe';
  mesh.position.set(x, y, z);

  obj.add(mesh);
}

function createForearm(obj, x, y, z, isRight){
  geometry = new THREE.BoxGeometry(forearmLength, forearmHeight, forearmWidth);
  mesh = new THREE.Mesh(geometry, materials[2]);

  mesh.name = isRight ? 'right forearm' : 'left forearm';
  mesh.position.set(x, y, z);

  obj.add(mesh);
}

function createWaist(obj) {
  var waist = new THREE.Object3D();
  waist.name = 'waist';

  geometry = new THREE.BoxGeometry(waistLength, waistHeight, waistWidth);
  mesh = new THREE.Mesh(geometry, materials[6]);

  waist.add(mesh);

  waist.position.set(0, -bodyHeight/2 - waistHeight/2, 0);
  obj.add(waist);
}

function createAbdomen(obj) {
  var abdomen = new THREE.Object3D();
  abdomen.name = 'abdomen';

  geometry = new THREE.BoxGeometry(abdomenLength, abdomenHeight, abdomenWidth);
  mesh = new THREE.Mesh(geometry, materials[5]);

  abdomen.add(mesh);

  createWheel(abdomen, abdomenLength/2, 0, wheelOffset, true);
  createWheel(abdomen, -abdomenLength/2, 0, wheelOffset, false);

  abdomen.position.set(0, -bodyHeight/2 - waistHeight - abdomenHeight/2, 0);

  obj.add(abdomen);
}

function createWheel(obj, x, y, z, isRight) {
  geometry = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelHeight, 32);
  geometry.rotateZ(Math.PI / 2);
  mesh = new THREE.Mesh(geometry, materials[7]);

  mesh.name = isRight ? 'right wheel' : 'left wheel';
  mesh.position.set(x, y, z);

  obj.add(mesh);
}

function createTrailer() {
  trailer = new THREE.Object3D();
  geometry = new THREE.BoxGeometry(trailerLength, trailerHeight, trailerWidth);
  mesh = new THREE.Mesh(geometry, materials[11]);

  mesh.name = 'trailer body';
  mesh.position.set(0, 0, trailerWidth/2);

  trailer.add(mesh);

  createWheel(trailer, trailerLength/2 + wheelHeight/2, -trailerHeight/2 - 1, wheelRadius, true);
  createWheel(trailer, -(trailerLength/2 + wheelHeight/2), -trailerHeight/2 - 1, wheelRadius, false);
  createWheel(trailer, trailerLength/2 + wheelHeight/2, -trailerHeight/2 - 1, 3*wheelRadius + 1 , true);
  createWheel(trailer, -trailerLength/2 - wheelHeight/2, -trailerHeight/2 - 1, 3*wheelRadius + 1 , false);

  createTrailerPiece(trailer, 0, -trailerHeight/2 - trailerPieceHeight/2, trailerWidth - wheelRadius);

  trailer.position.set(0, 0, -15 - trailerWidth/2 - trailerOffset);
  scene.add(trailer);
}

function createTrailerPiece (obj, x, y, z) {
  geometry = new THREE.CylinderGeometry(trailerPieceRadius, trailerPieceRadius, trailerPieceHeight, 32);
  geometry.rotateX(Math.PI / 2);
  mesh = new THREE.Mesh(geometry, materials[9]);
  mesh.name = 'trailer piece';
  mesh.position.set(x, y, z);
  obj.add(mesh);
}

function createFoot(obj) { 
  var feet = new THREE.Object3D();
  feet.name = 'feet';
  
  geometry = new THREE.BoxGeometry(footLength, footHeight, footWidth);
  mesh = new THREE.Mesh(geometry, materials[8]);
  mesh.position.set(footLength/2 + 0.5, footHeight/2, footWidth/2);
  mesh.name = 'right foot';
  feet.add(mesh);

  geometry = new THREE.BoxGeometry(footLength, footHeight, footWidth);
  mesh = new THREE.Mesh(geometry, materials[8]);
  mesh.position.set(-(footLength/2 + 0.5), footHeight/2, footWidth/2);
  mesh.name = 'left foot';
  feet.add(mesh);

  feet.position.set(0, -lowerLegHeight, lowerLegWidth/2)

  obj.add(feet);
}

function createLowerLeg(obj) {
  var lower_leg = new THREE.Object3D();

  geometry = new THREE.BoxGeometry(lowerLegLength, lowerLegHeight, lowerLegWidth);
  mesh = new THREE.Mesh(geometry, materials[4]);
  mesh.position.set(lowerLegLength/2 + 0.5, -lowerLegHeight/2, 0);
  mesh.name = 'right lower leg';
  lower_leg.add(mesh)

  geometry = new THREE.BoxGeometry(lowerLegLength, lowerLegHeight, lowerLegWidth);
  mesh = new THREE.Mesh(geometry, materials[4]);
  mesh.position.set(-(lowerLegLength/2 + 0.5), -lowerLegHeight/2, 0);
  mesh.name = 'left lower leg';
  lower_leg.add(mesh)

  createFoot(lower_leg);
  createWheel(lower_leg, -(wheelHeight/2 + 0.5 + lowerLegLength), -lowerLegHeight + wheelRadius + 0.5, 0, false);
  createWheel(lower_leg, -(wheelHeight/2 + 0.5 + lowerLegLength), - wheelRadius - 1, 0, false);
  createWheel(lower_leg, wheelHeight/2 + 0.5 + lowerLegLength, -lowerLegHeight + wheelRadius + 0.5, 0, true);
  createWheel(lower_leg, wheelHeight/2 + 0.5 + lowerLegLength, - wheelRadius - 1, 0, true);

  lower_leg.position.set(0, -upperLegHeight, 0)
  obj.add(lower_leg);
}

function createLegs(obj){
  var leg = new THREE.Object3D();
  leg.name = 'legs';

  geometry = new THREE.BoxGeometry(upperLegLength, upperLegHeight, upperLegWidth);
  mesh = new THREE.Mesh(geometry, materials[9]);
  mesh.position.set(upperLegLength/2 + 1, -upperLegHeight/2, 0);
  mesh.name = 'right upper leg';
  leg.add(mesh);

  geometry = new THREE.BoxGeometry(upperLegLength, upperLegHeight, upperLegWidth);
  mesh = new THREE.Mesh(geometry, materials[9]);
  mesh.position.set(-(upperLegLength/2 + 1), -upperLegHeight/2, 0);
  mesh.name = 'left upper leg';
  leg.add(mesh);

  createLowerLeg(leg);

  leg.position.y = -bodyHeight/2 - waistHeight - abdomenHeight/2;
  obj.add(leg);
}


///////////////////////////////////////////////////////
/*                    TASK 4 & 5                     */
///////////////////////////////////////////////////////

///////////////////////////////////////////////////////
/*              UPDATE ROBOT ANIMATION               */
///////////////////////////////////////////////////////

function updateFeetRotation() {
  const feet = robot.getObjectByName("feet");
  if (!feet) return;

  const maxRotation = Math.PI;
  const minRotation = 0;

  if (keyStates["Q"] && feet.rotation.x < maxRotation) {
    feet.rotation.x = Math.min(feet.rotation.x + moveSpeed, maxRotation);
  }

  if (keyStates["A"] && feet.rotation.x > minRotation) {
    feet.rotation.x = Math.max(feet.rotation.x - moveSpeed, minRotation);
  }
}

function updateWaistRotation() {
  const legs = robot.getObjectByName("legs");
  if (!legs) return;

  const maxRotation = Math.PI / 2;
  const minRotation = 0;

  if (keyStates["W"] && legs.rotation.x < maxRotation) {
    legs.rotation.x = Math.min(legs.rotation.x + moveSpeed, maxRotation);
  }

  if (keyStates["S"] && legs.rotation.x > minRotation) {
    legs.rotation.x = Math.max(legs.rotation.x - moveSpeed, minRotation);
  }
}

function updateHeadRotation() {
  const head = robot.getObjectByName("head");
  if (!head) return;

  const maxRotation = 0;
  const minRotation = -Math.PI;

  if (keyStates["F"] && head.rotation.x < maxRotation) {
    head.rotation.x = Math.min(head.rotation.x + moveSpeed, maxRotation);
  }

  if (keyStates["R"] && head.rotation.x > minRotation) {
    head.rotation.x = Math.max(head.rotation.x - moveSpeed, minRotation);
  }
}

function updateArmTranslation() {
  const leftArm = robot.getObjectByName("left arm");
  const rightArm = robot.getObjectByName("right arm");
  if (!leftArm || !rightArm) return;

  const maxOffset = bodyLength / 2 + armLength / 2;
  const minOffset = -maxOffset;

  if (keyStates["E"]) {
    if (leftArm.position.x < -bodyLength / 2 + armLength / 2) {
      leftArm.position.x = Math.min(leftArm.position.x + moveSpeed, -bodyLength / 2 + armLength / 2);
    }
    if (rightArm.position.x > bodyLength / 2 - armLength / 2) {
      rightArm.position.x = Math.max(rightArm.position.x - moveSpeed, bodyLength / 2 - armLength / 2);
    }
  }

  if (keyStates["D"]) {
    if (leftArm.position.x > -bodyLength / 2 - armLength / 2) {
      leftArm.position.x = Math.max(leftArm.position.x - moveSpeed, -bodyLength / 2 - armLength / 2);
    }
    if (rightArm.position.x < bodyLength / 2 + armLength / 2) {
      rightArm.position.x = Math.min(rightArm.position.x + moveSpeed, bodyLength / 2 + armLength / 2);
    }
  }
}

function updateTrailerMovement() {
  const direction = new THREE.Vector3();

  if (keyStates["LEFT"]) direction.x -= moveSpeed;
  if (keyStates["RIGHT"]) direction.x += moveSpeed;
  if (keyStates["FRONT"]) direction.z += moveSpeed;
  if (keyStates["BACK"]) direction.z -= moveSpeed;

  if (!direction.equals(new THREE.Vector3(0, 0, 0))) {
    attemptTrailerMove(direction);
  }
}

function update() {
  updateFeetRotation();
  updateWaistRotation();
  updateHeadRotation();
  updateArmTranslation();
  updateTrailerMovement();
}

///////////////////////////////////////////////////////
/*                    TASK 6                         */
///////////////////////////////////////////////////////

function changeWireframe() {
    for (let i = 0; i < materials.length; i++) {
        materials[i].wireframe = !materials[i].wireframe;
    }
}

///////////////////////////////////////////////////////
/*                    TASK 7                         */
///////////////////////////////////////////////////////

/////////////////////////////
/* CREATE BOUNDINGBOX AABB */
/////////////////////////////

function createBoundingBox(obj) {

    let minX = Infinity;
    let minY = Infinity;
    let minZ = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let maxZ = -Infinity;

    obj.traverse((child) => {
        if (child.name!='robot 3D' && child instanceof THREE.Mesh){
            const position = new THREE.Vector3();
            position.setFromMatrixPosition(child.matrixWorld);
            
            child.updateMatrixWorld();
            var positionBuffer = child.geometry.attributes.position.array;

            for (var i = 0; i < positionBuffer.length; i += 3) {
                var x = positionBuffer[i];
                var y = positionBuffer[i + 1];
                var z = positionBuffer[i + 2];

                var vertex = new THREE.Vector3(x, y, z);

                vertex.applyMatrix4(child.matrixWorld);
                minX = Math.min(minX, vertex.x);
                minY = Math.min(minY, vertex.y);
                minZ = Math.min(minZ, vertex.z);
                maxX = Math.max(maxX, vertex.x);
                maxY = Math.max(maxY, vertex.y);
                maxZ = Math.max(maxZ, vertex.z);
            }
        }
    });

    const boundingBox = {
        min: new THREE.Vector3(minX, minY, minZ),
        max: new THREE.Vector3(maxX, maxY, maxZ),
    };

    return boundingBox;
}

function intersectsBox(box1, box2){

    const intersectX = box1.max.x > box2.min.x && box1.min.x < box2.max.x;
    const intersectY = box1.max.y > box2.min.y && box1.min.y < box2.max.y;
    const intersectZ = box1.max.z > box2.min.z && box1.min.z < box2.max.z;
    
    return intersectX && intersectY && intersectZ;
}

///////////////////////////////////////////////////////
/*     TRAILER COLLISION DETECTION AND ANIMATION     */
///////////////////////////////////////////////////////

//////////////////////
/* MOVES OF TRAILER */
//////////////////////

function attemptTrailerMove(directionVector) {

  const trailerBody = trailer.getObjectByName("trailer body");
  if (!trailerBody) return;

  //const previousPosition = trailer.position.clone();

  if (!checkCollisions(directionVector)) {
    trailer.position.add(directionVector);
    trailerBody.userData.stopped = false;
  } else {
    handleCollisions(directionVector);
  }
}

//////////////////////
/* CHECK COLLISIONS */
//////////////////////

function checkCollisions(directionVector) {
  const trailerBody = trailer.getObjectByName("trailer body");
  const robotBody = robot.getObjectByName("body");

  if (!trailerBody || !robotBody) return false;

  const originalPosition = trailer.position.clone();
  trailer.position.add(directionVector);

  trailer.updateMatrixWorld(true);
  robot.updateMatrixWorld(true);

  const trailerBox = createBoundingBox(trailerBody);
  const robotBox = createBoundingBox(robotBody);

  // Repor a posição original
  trailer.position.copy(originalPosition);

  return intersectsBox(trailerBox, robotBox);
}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////

function handleCollisions(directionVector) {
  const trailerBody = trailer.getObjectByName("trailer body");
  if (trailerBody) {
    trailerBody.userData.stopped = true;
  }

  const targetPosition = new THREE.Vector3(0, 0, targetAxis_z); 

  // Voltar à posição anterior
  moveTrailerTo(targetPosition);
}

function moveTrailerTo(position) {
  trailerTargetPosition = position.clone();
  isAnimatingTrailer = true;
  requestAnimationFrame(animateTrailerStep);
}

function animateTrailerStep() {
  if (!isAnimatingTrailer || !trailerTargetPosition) return;

  const current = trailer.position.clone();
  const direction = new THREE.Vector3().subVectors(trailerTargetPosition, current);

  if (direction.lengthSq() < 0.01) {
    trailer.position.copy(trailerTargetPosition);
    isAnimatingTrailer = false;
    trailerTargetPosition = null;
    return;
  }

  direction.normalize().multiplyScalar(trailerReturnSpeed);
  trailer.position.add(direction);

  requestAnimationFrame(animateTrailerStep);
}

/////////////
/* DISPLAY */
/////////////

function render() {
  renderer.render(scene, cameras[currentCamera]);
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////

function init() {
    renderer = new THREE.WebGLRenderer({
        antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createMaterials();      // must create materials first
    createScene();
    createCamera();
    
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////

function animate() {
    update(); // aplicar as transformações
    render();
    requestAnimationFrame(animate);
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////

function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);

    if(window.innerHeight > 0 && window.innerWidth > 0) {
        cameras[currentCamera].aspect = window.innerWidth / window.innerHeight;
        cameras[currentCamera].updateProjectionMatrix();
    }

}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////

function onKeyDown(e) {
  switch (e.keyCode) {

    //  controlar o ângulo θ1 que roda o eixo de revolução dos pés
    case 81:
      keyStates["Q"] = true;
      break;
    case 65:
      keyStates["A"] = true;
      break;

    // controlar o ângulo θ2 que roda o eixo de revolução da cintura
    case 87:
      keyStates["W"] = true;
      break;
    case 83:
      keyStates["S"] = true;
      break;
      
    // controlar o deslocamento δ1 que translaciona os membros superiores medial e lateralmente;  
    case 69:
      keyStates["E"] = true;
      break;
    case 68:
      keyStates["D"] = true;
      break;

    // controlar o ângulo θ3 que roda o eixo de revolução da cabeça
    case 82:
      keyStates["R"] = true;
      break;
    case 70:
      keyStates["F"] = true;
      break;

    // controla o deslocamento do reboque
    case 37:
        keyStates["LEFT"] = true;
        break;
    case 38:
        keyStates["BACK"] = true;
        break;
    case 39:
        keyStates["RIGHT"] = true;
        break;
    case 40:
        keyStates["FRONT"] = true;
        break;
    
    // controla a perspetiva da câmera
    case 49:                // key 1 - câmera frontal
        changeCamera(0);
        break;
    case 50:                // key 2 - câmera lateral   
        changeCamera(1);
        break;
    case 51:                // key 3 - câmera superior
        changeCamera(2);
        break;
    case 52:                // key 4 - câmera perspetiva
        changeCamera(3);
        break;
    case 55:                // key 7 - wireframe
        changeWireframe();
         break;
    default:
      break;
  }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////

function onKeyUp(e) {
    switch (e.keyCode) {
        case 81:
            keyStates["Q"] = false;
            break;
        case 65:
            keyStates["A"] = false;
            break;
        case 87:
            keyStates["W"] = false;
            break;
        case 83:
            keyStates["S"] = false;
            break;
        case 69:
            keyStates["E"] = false;
            break;
        case 68:
            keyStates["D"] = false;
            break;
        case 82:
            keyStates["R"] = false;
            break;
        case 70:
            keyStates["F"] = false;
            break;
        case 37:
            keyStates["LEFT"] = false;
            break;
        case 38:
            keyStates["BACK"] = false;
            break;
        case 39:
            keyStates["RIGHT"] = false;
            break;
        case 40:
            keyStates["FRONT"] = false;
            break;
    }
}

init();
animate();