import * as THREE from './libs/three.js-r132/build/three.module.js';
import {ARButton} from './libs/three.js-r132/examples/jsm/webxr/ARButton.js';
import { Earth } from "./components/Earth.js";

document.addEventListener('DOMContentLoaded', () => {
  
  const initialize = async() => {
    const scene = new THREE.Scene();
    const scale = 0.25;
    
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    //lights
		const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.3);
		scene.add(ambient);

    const light = new THREE.DirectionalLight(0xffffff, 10);
    light.position.set( 8, 0, 3);
    scene.add(light);

    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    
    //load moon and earth
    const {earth, moon, group } = await Earth(scale, camera);
    
    let loaded = false;
    let stopped = true;
    let speed = .005;
    let oldSpeed = .005;
    let moonDistance = 1;
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

    const arButton = ARButton.createButton(renderer, {optionalFeatures: ['dom-overlay'], domOverlay: {root: document.body}});
    document.body.appendChild(renderer.domElement);
    document.body.appendChild(arButton);

    const controller = renderer.xr.getController(0);
    scene.add(controller);
    //add event listeners to detect a click and drag
    const clickPosition = new THREE.Vector3();
    controller.addEventListener('selectstart', () => {
      //get position of click
      const {x,y,z} = controller.position;
      //save click position as vector3  
      clickPosition.set(x, y, z);

    });
    controller.addEventListener('selectend', () => {
      //get position of click
      const {x,y,z} = controller.position;
      const releasePosition = new THREE.Vector3(x, y, z);
      let distance = (releasePosition.x - clickPosition.x) + (releasePosition.y - clickPosition.y) + (releasePosition.z - clickPosition.z);

      //add distance to moonDistance and clamp to .1-1
      moonDistance += distance*3;
      moonDistance = Math.max(moonDistance, .03);
      moonDistance = Math.min(moonDistance, 1);

      //set the moon's z position to moonStartZ*moonDistance
      moon.scene.position.z = moonDistance*moonStartZ;
      console.log(moon.scene.position.z);


      

    });
    controller.addEventListener('select', () => {
      if(!stopped){
        oldSpeed = speed;
        speed = 0;
        stopped = true;
      }else(
        speed = oldSpeed, stopped = false
      )

      if(!loaded){
        group.position.applyMatrix4(controller.matrixWorld);
        //group.quaternion.setFromRotationMatrix(controller.matrixWorld);
        group.position.set(0,0,-0.5)
        scene.add(group);
        loaded = true;
      }
    });
  }
  

  initialize();
});