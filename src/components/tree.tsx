import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { Mesh, MeshStandardMaterial } from "three";
import { GlobalState, useGlobalStore } from "../stores/useGlobalStore";
import { useFrame } from "@react-three/fiber";

const uniforms = {
  uWaterLevel: { value: 0 },
  uTime: { value: 1 },
  uWaveSpeed: { value: 0 },
  uWaveAmplitude: { value: 0 },
  uFoamDepth: { value: 0 },
}

const glsl = (x: any) => x;
export default function Tree () {
  const {scene} = useGLTF("models/palm-bend.glb");
    
  const waterLevel = useGlobalStore((state: GlobalState) => state.waterLevel);
  const waveSpeed = useGlobalStore((state: GlobalState) => state.waveSpeed);
  const waveAmplitude = useGlobalStore((state: GlobalState) => state.waveAmplitude);
  const foamDepth = useGlobalStore((state) => state.foamDepth)

  useEffect(() => { uniforms.uWaterLevel.value = waterLevel }, [ waterLevel ]);
  useEffect(() => { uniforms.uWaveSpeed.value = waveSpeed }, [ waveSpeed ]);
  useEffect(() => { uniforms.uWaveAmplitude.value = waveAmplitude }, [ waveAmplitude ]);
  useEffect(() => { uniforms.uFoamDepth.value = foamDepth * 5 }, [ foamDepth ]);  

  const { geometry, material } = useMemo(() => {
      const geometry = (scene.children[0] as Mesh).geometry;
      const material = (scene.children[0] as Mesh).material as MeshStandardMaterial;

      material.onBeforeCompile = (shader) => {
          shader.uniforms.uWaterLevel = uniforms.uWaterLevel;
          shader.uniforms.uTime = uniforms.uTime;
          shader.uniforms.uWaveSpeed = uniforms.uWaveSpeed;
          shader.uniforms.uWaveAmplitude = uniforms.uWaveAmplitude;
          shader.uniforms.uFoamDepth = uniforms.uFoamDepth;
    
          const vertexShaderHeader = glsl`
              varying vec4 vPosition;
          `;
          shader.vertexShader = `
              ${vertexShaderHeader}
              
              ${shader.vertexShader}      
          `.replace(
                glsl`#include <displacementmap_vertex>`,
                glsl`
                  #include <displacementmap_vertex>
                  
                  // Output position
                  vPosition = modelMatrix * vec4(transformed, 1.0);
                `
            );
    
          const fragmentShaderHeader = glsl`
              uniform float uWaterLevel;
              uniform float uTime;
              uniform float uWaveSpeed;
              uniform float uWaveAmplitude;
              uniform float uFoamDepth;
              
              varying vec4 vPosition;
          `;  
          shader.fragmentShader = `
              ${fragmentShaderHeader}
    
              ${shader.fragmentShader}
            `.replace(
              glsl`#include <color_fragment>`,
              glsl`
                #include <color_fragment>
                
                // Set the current color as the base color
                vec3 baseColor = diffuseColor.rgb;
            
                float positionHeight = vPosition.y;        
            
                // Foam Effect
                // Get the y position based on sine function, oscillating up and down over time
                float sineOffset = sin(uTime * uWaveSpeed) * uWaveAmplitude;
                
                // The current dynamic water height
                float currentWaterHeight = uWaterLevel + sineOffset;
    
                float stripe = smoothstep(currentWaterHeight + 0.01, currentWaterHeight - 0.01, vPosition.y) - 
                                smoothstep(currentWaterHeight + uFoamDepth + 0.01, currentWaterHeight + uFoamDepth - 0.01, vPosition.y);
                
                vec3 stripeColor = vec3(1.0, 1.0, 1.0); // White stripe
                
                // Apply the foam strip to baseColor    
                vec3 finalColor = mix(baseColor - stripe, stripeColor, stripe);
                
                diffuseColor.rgb = finalColor;
              `
          );
        }
    
      return { geometry, material }
  }, []);
    
  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime();
  });
  
  return (
    <mesh 
      position={[0, 1, 0]}
      rotation-y={Math.PI * Math.random()}
      geometry={geometry}
      material={material}
      castShadow={true}
    />
  )
}

useGLTF.preload("models/palm-bend.glb")
