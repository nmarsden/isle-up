import { useGLTF } from "@react-three/drei";
import { ReactNode, useEffect, useMemo, useRef } from "react";
import { Color, Mesh, MeshStandardMaterial, Vector3 } from "three";
import { CELL_WIDTH, GlobalState, toRowAndCol, useGlobalStore, Y_DOWN, Y_UP } from "../stores/useGlobalStore";
import { folder, useControls } from "leva";
import { useFrame } from "@react-three/fiber";
import { lerp } from "three/src/math/MathUtils.js";

const glsl = (x: any) => x;

const islandAnimationDurationMSecs = 300;

export default function Island ({ id, children }: { id: number, children: ReactNode }) {
  const { nodes } = useGLTF('models/terrain2.glb', false);
  const mesh = useRef<Mesh>(null);

  const underwaterColor = useGlobalStore((state: GlobalState) => state.underwaterColor);
  const waterLevel = useGlobalStore((state: GlobalState) => state.waterLevel);
  const waveSpeed = useGlobalStore((state: GlobalState) => state.waveSpeed);
  const waveAmplitude = useGlobalStore((state: GlobalState) => state.waveAmplitude);
  const foamDepth = useGlobalStore((state) => state.foamDepth)
  const hoveredIds = useGlobalStore((state: GlobalState) => state.hoveredIds);
  const hoveredColor = useGlobalStore((state: GlobalState) => state.hoveredColor);
  const setUnderwaterColor = useGlobalStore((state: GlobalState) => state.setUnderwaterColor);
  const setHoveredColor = useGlobalStore((state: GlobalState) => state.setHoveredColor);

  const toggledIds = useGlobalStore((state: GlobalState) => state.toggledIds);

  const islandAnimationStartTime = useRef(new Date().getTime());
  const animating = useRef(false);
  const up = useRef(true);

  useEffect(() => {
    if (toggledIds.includes(id)) {
      up.current = !up.current;

      // toggle detected - starting animating
      animating.current = true;
      islandAnimationStartTime.current = new Date().getTime();
    }
  }, [ toggledIds ]);  

  const {
    planeMetalness, planeRoughness, planeWireframe, planeFlatShading, islandShadows
  } = useControls(
    'Island',
    {
      'Plane': folder(
        {
          sandBaseColor: { value: "#ff9900", label: "Sand", onChange: (value) => { uniforms.uBaseColor.value = new Color(value); } },
          grassColor: { value: "yellow", label: "Grass", onChange: (value) => { uniforms.uGrassColor.value = new Color(value); } },
          underwaterColor: { value: `#${underwaterColor.getHexString()}`, label: "Underwater", transient: false, onChange: (value) => { setUnderwaterColor(new Color(value)); } },
          hoveredColor: { value: `#${hoveredColor.getHexString()}`, label: "Hovered", transient: false, onChange: (value) => { setHoveredColor(new Color(value)); } },
          planeMetalness: { value: 0.0, label: 'metalness', min: 0, max: 1, step: 0.01 },
          planeRoughness: { value: 0.7, label: 'roughness', min: 0, max: 1, step: 0.01 },
          planeWireframe: { value: false, label: 'wireframe' },
          planeFlatShading: { value: false, label: 'flatShading' },
          islandShadows: { value: true, label: 'shadows' },
        }
      )
    },
    {
      collapsed: true
    }
  );

  useEffect(() => { uniforms.uUnderwaterColor.value = underwaterColor }, [ underwaterColor ]);
  useEffect(() => { uniforms.uWaterLevel.value = waterLevel }, [ waterLevel ]);
  useEffect(() => { uniforms.uWaveSpeed.value = waveSpeed }, [ waveSpeed ]);
  useEffect(() => { uniforms.uWaveAmplitude.value = waveAmplitude }, [ waveAmplitude ]);
  useEffect(() => { uniforms.uFoamDepth.value = foamDepth }, [ foamDepth ]);
  useEffect(() => { uniforms.uHovered.value = hoveredIds.includes(id) ? 1 : 0 }, [ hoveredIds ]);  
  useEffect(() => { uniforms.uHoveredColor.value = hoveredColor }, [ hoveredColor ]);

  const { islandPosition, islandRotationY, islandGeometry, islandMaterial, uniforms } = useMemo(() => {

    /* Position */
    const { row, col } = toRowAndCol(id);
    const x = col * CELL_WIDTH - (2 * CELL_WIDTH);
    const y = Y_UP;
    const z = row * CELL_WIDTH - (2 * CELL_WIDTH);
    const islandPosition = new Vector3(x, y, z);

    /* Rotation Y */
    const islandRotationY = Math.random() * Math.PI * 2;

    /* Geometry */
    const islandGeometry = (nodes['Terrain-02'] as Mesh).geometry;

    /* Uniforms */
    const uniforms = {
      uBaseColor: { value: new Color() },
      uGrassColor: { value: new Color() },
      uUnderwaterColor: { value: new Color() },
      uHoveredColor: { value: new Color() },
      uWaterLevel: { value: 0 },
      uTime: { value: 1 },
      uWaveSpeed: { value: 0 },
      uWaveAmplitude: { value: 0 },
      uFoamDepth: { value: 0 },
      uHovered: { value: 0 }
    }

    /* Material */
    const islandMaterial = new MeshStandardMaterial({
      wireframe: planeWireframe,
      roughness: planeRoughness,
      metalness: planeMetalness,
      flatShading: planeFlatShading,
      toneMapped: false
    });

    islandMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uBaseColor = uniforms.uBaseColor;
      shader.uniforms.uGrassColor = uniforms.uGrassColor;
      shader.uniforms.uUnderwaterColor = uniforms.uUnderwaterColor;
      shader.uniforms.uHoveredColor = uniforms.uHoveredColor;
      shader.uniforms.uWaterLevel = uniforms.uWaterLevel;
      shader.uniforms.uTime = uniforms.uTime;
      shader.uniforms.uWaveSpeed = uniforms.uWaveSpeed;
      shader.uniforms.uWaveAmplitude = uniforms.uWaveAmplitude;
      shader.uniforms.uFoamDepth = uniforms.uFoamDepth;
      shader.uniforms.uHovered = uniforms.uHovered;

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
          uniform vec3 uBaseColor;
          uniform vec3 uGrassColor;
          uniform vec3 uUnderwaterColor;
          uniform vec3 uHoveredColor;
          uniform float uTime;
          uniform float uWaveSpeed;
          uniform float uWaveAmplitude;
          uniform float uFoamDepth;
          uniform float uHovered;

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
            vec3 baseColor = uBaseColor;
        
            float positionHeight = vPosition.y;        
        
            float a = 0.1;
            float b = 0.04;
            float c = 0.08;
            float d = 0.4;
            
            //float a = 1.0;
            //float b = 0.2;
            //float c = 0.8;
            //float d = 3.0;
            
            // Darken the base color at lower Y values to simulate wet sand
            float heightFactor = smoothstep(uWaterLevel + a, uWaterLevel, positionHeight);
            baseColor = mix(baseColor, baseColor * 0.5, heightFactor);
        
            // Blend underwater color with base planeMesh to add depth to the ocean bottom
            float oceanFactor = smoothstep(min(uWaterLevel - (b * 2.0), b), 0.0, positionHeight);
            baseColor = mix(baseColor, uUnderwaterColor, oceanFactor);
        
            // Add grass to the higher areas of the terrain
            float grassFactor = smoothstep(uWaterLevel + c, max(uWaterLevel + (c * 2.0), d), positionHeight);
            baseColor = mix(baseColor, uGrassColor, grassFactor);
        
            // Foam Effect
            // Get the y position based on sine function, oscillating up and down over time
            float sineOffset = sin(uTime * uWaveSpeed) * uWaveAmplitude;
            
            // The current dynamic water height
            float currentWaterHeight = uWaterLevel + sineOffset;

            float stripe = smoothstep(currentWaterHeight + 0.01, currentWaterHeight - 0.01, positionHeight) - 
                           smoothstep(currentWaterHeight + uFoamDepth + 0.01, currentWaterHeight + uFoamDepth - 0.01, positionHeight);
            
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

    return { islandPosition, islandRotationY, islandGeometry, islandMaterial, uniforms };
  },
  [
    planeMetalness, planeRoughness, planeWireframe, planeFlatShading
  ]);

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime();

    if (!mesh.current) return;

    // Animate islands y position
    const elapsedTime = new Date().getTime() - islandAnimationStartTime.current;
    const animationProgress = elapsedTime / islandAnimationDurationMSecs;
    if (animating.current) {
      if ((animationProgress > 1)) {
        animating.current = false;
      } else {
        const y = up.current ? lerp(Y_DOWN, Y_UP, animationProgress) : lerp(Y_UP, Y_DOWN, animationProgress);
        (mesh.current as Mesh).position.y = y;
      }
    }
  });
  
  return (
    <mesh 
      ref={mesh} 
      scale={0.95}
      position={islandPosition}
      rotation-y={islandRotationY}
      geometry={islandGeometry}
      material={islandMaterial}
      castShadow={islandShadows}
      receiveShadow={islandShadows}
    >
      {children}
    </mesh>
  )
}

useGLTF.preload('models/terrain2.glb', false);
