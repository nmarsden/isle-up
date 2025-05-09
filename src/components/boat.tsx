import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import { Color, Mesh, MeshStandardMaterial } from "three";
import { GlobalState, useGlobalStore } from "../stores/useGlobalStore";
import { useFrame } from "@react-three/fiber";
import { lerp } from "three/src/math/MathUtils.js";

const glsl = (x: any) => x;

const boatAnimationDurationMSecs = 300;

// Note: these Y positions are relative to the island
const boatUpPositionY = 0.7;
const boatDownPositionY = 1.5;

export default function Boat ({ id }: { id: number }) {
  const { nodes, materials } = useGLTF("models/boat-row-small.glb");
    
  const waterLevel = useGlobalStore((state: GlobalState) => state.waterLevel);
  const waveSpeed = useGlobalStore((state: GlobalState) => state.waveSpeed);
  const waveAmplitude = useGlobalStore((state: GlobalState) => state.waveAmplitude);
  const foamDepth = useGlobalStore((state) => state.foamDepth)
  const hoveredIds = useGlobalStore((state: GlobalState) => state.hoveredIds);
  const hoveredColor = useGlobalStore((state: GlobalState) => state.hoveredColor);
  const toggledIds = useGlobalStore((state: GlobalState) => state.toggledIds);

  const meshRef = useRef<Mesh>(null!);
  
  const up = useRef(true);

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

  const boatAnimationStartTime = useRef(new Date().getTime());
  const animatingToggle = useRef(false);
  
  useEffect(() => { uniforms.uWaterLevel.value = waterLevel }, [ waterLevel ]);
  useEffect(() => { uniforms.uWaveSpeed.value = waveSpeed }, [ waveSpeed ]);
  useEffect(() => { uniforms.uWaveAmplitude.value = waveAmplitude }, [ waveAmplitude ]);
  useEffect(() => { uniforms.uFoamDepth.value = foamDepth * 5 }, [ foamDepth ]);  
  useEffect(() => { uniforms.uHovered.value = hoveredIds.includes(id) ? 1 : 0 }, [ hoveredIds ]);  
  useEffect(() => { uniforms.uHoveredColor.value = hoveredColor }, [ hoveredColor ]);  


  useEffect(() => {
    if (toggledIds.includes(id)) {
      up.current = !up.current;

      // toggle detected - starting animating toggle
      animatingToggle.current = true;
      boatAnimationStartTime.current = new Date().getTime();
    }
  }, [ toggledIds ]);  

  const { visible, boatGeometry, paddlesGeometry, material, position, rotationY } = useMemo(() => {
      const visible = Math.random() < 0.1;
      const boatGeometry = (nodes['boat-row-small_1'] as Mesh).geometry;
      const paddlesGeometry = (nodes['paddles'] as Mesh).geometry;
      const material = (materials.colormap as MeshStandardMaterial).clone();

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
              varying vec4 vPosition2;
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
                  vPosition2 = viewMatrix * modelMatrix * vec4(transformed, 1.0);
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
              varying vec4 vPosition2;
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
                // float aboveWaterLevel = step(currentWaterHeight, positionHeight);
                // float hovered = aboveWaterLevel * uHovered * ((1.0 + sin((vPosition2.x * PI) + (uTime * 4.0))) * 0.3) * (1.0 + (sin(PI * uTime) * 0.5));
                // finalColor = mix(finalColor, uHoveredColor, hovered);

                diffuseColor.rgb = finalColor;
              `
          );
        }
    
        const angle = (1.33 * Math.PI) + (0.5 * Math.PI * Math.random());
        const radius = 3;
        const x = radius * Math.cos(angle);
        const y = boatUpPositionY;
        const z = radius * Math.sin(angle);
        const position: [number, number, number] = [x, y, z];

        const rotationY = Math.random() * Math.PI * 2;

      return { visible, boatGeometry, paddlesGeometry, material, position, rotationY }
  }, []);
    
  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime();

    if (!meshRef.current) return;

    // animate boat
    const elapsedTime = new Date().getTime() - boatAnimationStartTime.current;
    const animationProgress = elapsedTime / boatAnimationDurationMSecs;
    if (animatingToggle.current) {
      if ((animationProgress > 1)) {
        animatingToggle.current = false;
        if (!up.current) {
          // start animating floating boat
          boatAnimationStartTime.current = new Date().getTime();
        }
      } else {
        const posY = up.current ? lerp(boatDownPositionY, boatUpPositionY, animationProgress) : lerp(boatUpPositionY, boatDownPositionY, animationProgress);
        meshRef.current.position.y = posY;
        if (up.current) {
          meshRef.current.rotation.x = lerp(meshRef.current.rotation.x, 0, animationProgress);
        }
      }
    } else if (!up.current) {
      // animate floating boat
      meshRef.current.position.y = boatDownPositionY + (0.05 * Math.sin(elapsedTime * 0.001));
      meshRef.current.rotation.x = Math.PI * (0.05 * Math.sin(elapsedTime * 0.001));
      meshRef.current.rotation.y += 0.0025 * Math.sin(elapsedTime * 0.00025);
    }
  });
  
  return (
    <group >
      <mesh
        ref={meshRef} 
        visible={visible}
        position={position}
        rotation-y={rotationY}
        geometry={boatGeometry}
        material={material}
        castShadow={true}
        receiveShadow={true}
      >
        <mesh
          position={[0, 0.056, -0.175]}
          geometry={paddlesGeometry}
          material={material}
          castShadow={true}
          receiveShadow={true}
        />
      </mesh>
    </group>
  )
}

useGLTF.preload("models/boat-row-small.glb")
