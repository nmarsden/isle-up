import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { Color, Mesh, MeshStandardMaterial } from "three";
import { GlobalState, useGlobalStore } from "../stores/useGlobalStore";
import { useFrame } from "@react-three/fiber";

const glsl = (x: any) => x;

export default function Tree ({ id }: { id: number }) {
  const {scene} = useGLTF("models/palm-bend.glb");
    
  const waterLevel = useGlobalStore((state: GlobalState) => state.waterLevel);
  const waveSpeed = useGlobalStore((state: GlobalState) => state.waveSpeed);
  const waveAmplitude = useGlobalStore((state: GlobalState) => state.waveAmplitude);
  const foamDepth = useGlobalStore((state) => state.foamDepth)
  const hoveredIds = useGlobalStore((state: GlobalState) => state.hoveredIds);
  const hoveredColor = useGlobalStore((state: GlobalState) => state.hoveredColor);

  const uniforms = useMemo(() => {
    return {
      uWaterLevel: { value: 0 },
      uTime: { value: 1 },
      uWaveSpeed: { value: 0 },
      uWaveAmplitude: { value: 0 },
      uFoamDepth: { value: 0 },
      uHovered: { value: 0 },
      uHoveredColor: { value: new Color() }
    }
  }, []);

  useEffect(() => { uniforms.uWaterLevel.value = waterLevel }, [ waterLevel ]);
  useEffect(() => { uniforms.uWaveSpeed.value = waveSpeed }, [ waveSpeed ]);
  useEffect(() => { uniforms.uWaveAmplitude.value = waveAmplitude }, [ waveAmplitude ]);
  useEffect(() => { uniforms.uFoamDepth.value = foamDepth * 5 }, [ foamDepth ]);  
  useEffect(() => { uniforms.uHovered.value = hoveredIds.includes(id) ? 1 : 0 }, [ hoveredIds ]);  
  useEffect(() => { uniforms.uHoveredColor.value = hoveredColor }, [ hoveredColor ]);  

  const { geometry, material, rotationY } = useMemo(() => {
      const geometry = (scene.children[0] as Mesh).geometry;
      const material = ((scene.children[0] as Mesh).material as MeshStandardMaterial).clone();

      material.onBeforeCompile = (shader) => {
          shader.uniforms.uWaterLevel = uniforms.uWaterLevel;
          shader.uniforms.uTime = uniforms.uTime;
          shader.uniforms.uWaveSpeed = uniforms.uWaveSpeed;
          shader.uniforms.uWaveAmplitude = uniforms.uWaveAmplitude;
          shader.uniforms.uFoamDepth = uniforms.uFoamDepth;
          shader.uniforms.uHovered = uniforms.uHovered;
          shader.uniforms.uHoveredColor = uniforms.uHoveredColor;
    
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
              uniform float uHovered;
              uniform vec3 uHoveredColor;

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
                
                // Apply the hovered color according to uHovered
                float aboveWaterLevel = step(currentWaterHeight, positionHeight);
                float hovered = aboveWaterLevel * uHovered * (0.2 + ((1.0 + sin(uTime * uHovered * 2.0)) * 0.3));
                finalColor = mix(finalColor, uHoveredColor, hovered);

                diffuseColor.rgb = finalColor;
              `
          );
        }
    
        const rotationY = Math.PI * Math.random();

      return { geometry, material, rotationY }
  }, []);
    
  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime();
  });
  
  return (
    <mesh 
      position={[0, 1, 0]}
      rotation-y={rotationY}
      geometry={geometry}
      material={material}
      castShadow={true}
    />
  )
}

useGLTF.preload("models/palm-bend.glb")
