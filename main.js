import * as THREE from './libs/three.js-r132/build/three.module.js';
import { ARButton } from './libs/three.js-r132/examples/jsm/webxr/ARButton.js';
import { Earth } from "./components/Earth.js";

document.addEventListener('DOMContentLoaded', () => {

  const initialize = async () => {
    const scene = new THREE.Scene();
    const scale = 0.25;
    const informationElement = await document.querySelector('#information');



    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);


    //lights
    const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.3);
    scene.add(ambient);

    const light = new THREE.DirectionalLight(0xffffff, 10);
    light.position.set(8, 0, 3);
    scene.add(light);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });



    //load moon and earth
    const { earth, moon, group } = await Earth(scale, camera);

    let loaded = false;
    let stopped = true;
    let speed = .005;
    let oldSpeed = speed;
    let time = null;
    //save the moon scene starting z position
    const moonStartZ = moon.scene.position.z;
    const clock = new THREE.Clock();

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    renderer.setAnimationLoop(() => {

      const delta = clock.getDelta();
      earth.scene.rotation.y += delta * speed * 27;
      moon.scene.rotation.y += delta * speed;

      group.rotation.y += delta * speed;
      renderer.render(scene, camera);

    });

    const arButton = ARButton.createButton(renderer, { optionalFeatures: ['dom-overlay'], domOverlay: { root: document.body } });
    document.body.appendChild(renderer.domElement);
    document.body.appendChild(arButton);
    //when arbutton is clicked set infromation element to hidden  
    arButton.addEventListener('click', () => {
      informationElement.style.display = 'none';
    });

    //make a controller to access the touch events
    const controller = renderer.xr.getController(0);

    scene.add(controller);
    //add event listeners to detect a click and drag
    const clickPosition = new THREE.Vector3();





    controller.addEventListener('selectstart', () => {
      //get the current time
      time = clock.getElapsedTime();
      //save the click position to clickPosition
      controller.matrixWorld.decompose(clickPosition, controller.quaternion, controller.scale);

      if (!stopped) {
        oldSpeed = speed;
        speed = 0;
        stopped = true;
      } else (
        speed = oldSpeed, stopped = false
      )

      if (!loaded) {
        group.position.applyMatrix4(controller.matrixWorld);
        //find a point 2 units forward of the camera
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(camera.quaternion);
        forward.multiplyScalar(.5);
        //set group forward to the new point
        group.position.add(forward);

        //set height of group to click position
        group.position.y = clickPosition.y;

        scene.add(group);
        loaded = true;
      }

    });

    controller.addEventListener('selectend', () => {
      if (loaded) {

        //if the current time is greater than the time of the click + .5 second
        if (clock.getElapsedTime() > time + 0.5) {
          //if moon.scene.position.z is equal to moonStartZ
          if (moon.scene.position.z == moonStartZ) {
            //set the  moon.scene.position.z to the moonStartZ * .03
            moon.scene.position.z = moonStartZ * .03;
          } else {
            //else set the moon.scene.position.z to moonStartZ
            moon.scene.position.z = moonStartZ;
          }
        }

      }


    });
  }


  initialize();
});