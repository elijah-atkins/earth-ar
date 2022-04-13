import {loadGLTF} from "../libs/loader.js";
import * as THREE from '../libs/three.js-r132/build/three.module.js';

export const Earth = async(scale, camera) => {
       //load moon and earth
       const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(.45*scale, 50, 50),
        new THREE.ShaderMaterial({
          vertexShader: vertexShader(),
          fragmentShader: fragmentShader(),
          transparent: true, 
          opacity: 0.4,
          uniforms: 
          { 
              "c":   { type: "f", value: 0.3 },
              "p":   { type: "f", value: 2.0 },
              glowColor: { type: "c", value: new THREE.Color(0x33b0ff) },
              viewVector: { type: "v3", value: camera.position },
  
          },                  
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
          transparent: true
        })
      )
  
  
   const glowSphere = new THREE.Mesh(
    new THREE.SphereGeometry(.45*scale, 50, 50),
    new THREE.ShaderMaterial({
      vertexShader: vertexShader(),
      fragmentShader: fragmentShader(),
  
      uniforms: 
      { 
          "c":   { type: "f", value: 0.8 },
          "p":   { type: "f", value: 1.5 },
          glowColor: { type: "c", value: new THREE.Color(0xeeeeee) },
          viewVector: { type: "v3", value: camera.position },
  
      },                  
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
    })
  )
  
      const earth = await loadGLTF('../../assets/models/space/earth.glb');
      earth.scene.scale.set(0.0008*scale, 0.0008*scale, 0.0008*scale);
      earth.scene.rotation.set( 0.410, 0, 0 );
  
      const moon = await loadGLTF('../../assets/models/space/moon.glb');
      moon.scene.scale.set(0.000216*scale, 0.000216*scale, 0.000216*scale);
      moon.scene.position.set( 0, 0, -28*scale );
      moon.scene.rotation.set( 0
        , 2.88548194, 0 );

        const group = new THREE.Group();

        group.add(earth.scene, moon.scene, sphere, glowSphere);

        return {earth, moon, group}
}

function vertexShader() {
    return `
    uniform vec3 viewVector;
    uniform float c;
    uniform float p;
    varying float intensity;
    void main() 
    {
        vec3 vNormal = normalize( normalMatrix * normal );
        vec3 vNormel = normalize( normalMatrix * viewVector );
        intensity = pow( c - dot(vNormal, vec3(0,0,1.0)), p );
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
    `
  }

  function fragmentShader() {
    return `
    uniform vec3 glowColor;
    varying float intensity;
    void main() 
    {
        vec3 glow = glowColor * intensity;
        gl_FragColor = vec4( glow, 1.0 );
    }
`
  }

