import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import { Color, Mesh, MeshStandardMaterial } from "three";
import { GlobalState, useGlobalStore } from "../stores/useGlobalStore";
import { useFrame } from "@react-three/fiber";
import { lerp } from "three/src/math/MathUtils.js";

const glsl = (x: any) => x;

const chestAnimationDurationMSecs = 300;

// Note: these Y positions are relative to the island
const chestUpPositionY = 0.6;
const chestDownPositionY = 0.9;

export default function Chest ({ id }: { id: number }) {
  const { nodes, materials } = useGLTF("models/chest.glb");

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

  const chestAnimationStartTime = useRef(new Date().getTime());
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
      chestAnimationStartTime.current = new Date().getTime();
    }
  }, [ toggledIds ]);  

  const { visible, chestGeometry, lidGeometry, material, position, rotationY } = useMemo(() => {
      const visible = Math.random() < 0.1;
      const chestGeometry = (nodes.chest_1 as Mesh).geometry;
      const lidGeometry = (nodes.lid as Mesh).geometry;

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
    
        const angle = (0.66 * Math.PI) + (0.5 * Math.PI * Math.random());
        const radius = 3;
        const x = radius * Math.cos(angle);
        const y = chestUpPositionY;
        const z = radius * Math.sin(angle);
        const position: [number, number, number] = [x, y, z];

        const rotationY = Math.random() * Math.PI * 2;

      return { visible, chestGeometry, lidGeometry, material, position, rotationY }
  }, []);
    
  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime();

    if (!meshRef.current) return;

    // animate chest
    const elapsedTime = new Date().getTime() - chestAnimationStartTime.current;
    const animationProgress = elapsedTime / chestAnimationDurationMSecs;
    if (animatingToggle.current) {
      if ((animationProgress > 1)) {
        animatingToggle.current = false;
        if (!up.current) {
          // start animating floating chest
          chestAnimationStartTime.current = new Date().getTime();
        }
      } else {
        const posY = up.current ? lerp(chestDownPositionY, chestUpPositionY, animationProgress) : lerp(chestUpPositionY, chestDownPositionY, animationProgress);
        meshRef.current.position.y = posY;
        if (up.current) {
          meshRef.current.rotation.x = lerp(meshRef.current.rotation.x, 0, animationProgress);
        }
      }
    } else if (!up.current) {
      // animate floating chest
      meshRef.current.position.y = chestDownPositionY + (0.2 * Math.sin(elapsedTime * 0.001));
      meshRef.current.rotation.x = Math.PI * (0.1 * Math.sin(elapsedTime * 0.001));
      meshRef.current.rotation.y += Math.PI * 0.001;
    }
  });
  
  return (
    <group visible={visible}>
      {/* Chest */}
      <mesh
        ref={meshRef} 
        position={position}
        rotation-y={rotationY}
        geometry={chestGeometry}
        material={material}
        castShadow={true}
        receiveShadow={true}
        >
        {/* Lid */}
        <mesh
          position={[0, 0.51, -0.51]}
          geometry={lidGeometry}
          material={material}
          castShadow={true}
          receiveShadow={true}
        />
      </mesh>
    </group>
  )
}

useGLTF.preload("models/chest.glb")
