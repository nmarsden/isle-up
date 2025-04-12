import {useEffect, useMemo, useRef} from "react";
import {CanvasTexture, Color, Mesh, MeshStandardMaterial, PlaneGeometry} from "three";
import {useFrame} from "@react-three/fiber";
import {folder, useControls} from "leva";
import {GlobalState, useGlobalStore} from "../stores/useGlobalStore.ts";

/**
 * Displacement
 */
// 2D canvas
const displacementCanvas = document.createElement('canvas');
displacementCanvas.width = 128
displacementCanvas.height = 128
displacementCanvas.style.position = 'fixed'
displacementCanvas.style.width = '256px'
displacementCanvas.style.height = '256px'
displacementCanvas.style.top = '0'
displacementCanvas.style.left = '0'
displacementCanvas.style.zIndex = '10'
document.body.append(displacementCanvas)

// Context
const displacementContext = displacementCanvas.getContext('2d') as CanvasRenderingContext2D;
displacementContext.fillRect(0, 0, displacementCanvas.width, displacementCanvas.height);

// Mound image
const displacementMoundImage = new Image()
displacementMoundImage.src = './textures/Circular.png'

// Texture
const displacementTexture = new CanvasTexture(displacementCanvas);

// Mounds
// const mounds: { x: number; y: number; off: boolean }[] = [];
// for (let x=0; x<5; x++) {
//   for (let y=0; y<5; y++) {
//     mounds.push({ x, y, off: (x === 2 && y === 2) });
//   }
// }

const uniforms = {
  uBaseColor: { value: new Color() },
  uGrassColor: { value: new Color() },
  uUnderwaterColor: { value: new Color() },
  uWaterLevel: { value: 0 },
  uTime: { value: 1 },
  uWaveSpeed: { value: 0 },
  uWaveAmplitude: { value: 0 },
  uFoamDepth: { value: 0 },
}

export default function Island() {
  const waterLevel = useGlobalStore((state: GlobalState) => state.waterLevel);
  const waveSpeed = useGlobalStore((state: GlobalState) => state.waveSpeed);
  const waveAmplitude = useGlobalStore((state: GlobalState) => state.waveAmplitude);
  const foamDepth = useGlobalStore((state) => state.foamDepth)

  const planeMesh = useRef<Mesh>(null!);

  const {
    underwaterColor, planeColor, planeMetalness, planeRoughness, positionY, planeDisplacementScale, planeSize, planeSegments, planeWireframe, planeFlatShading, planeShadows, planeMoundClearAlpha
  } = useControls(
    'Island',
    {
      'Plane': folder(
        {
          sandBaseColor: { value: "#ff9900", label: "Sand", onChange: (value) => { uniforms.uBaseColor.value = new Color(value); } },
          grassColor: { value: "#85a02b", label: "Grass", onChange: (value) => { uniforms.uGrassColor.value = new Color(value); } },
          underwaterColor: { value: "#118a4f", label: "Underwater", transient: false, onChange: (value) => { uniforms.uUnderwaterColor.value = new Color(value); } },
          positionY: { value: 0, label: 'positionY', min: -10, max: 10, step: 0.05 },
          planeColor: {value: '#f8ed3b', label: 'color'},
          planeMetalness: { value: 0.0, label: 'metalness', min: 0, max: 1, step: 0.01 },
          planeRoughness: { value: 0.7, label: 'roughness', min: 0, max: 1, step: 0.01 },
          planeDisplacementScale: { value: 0.5, label: 'displacementScale', min: 0, max: 10, step: 0.1 },
          planeSize: { value: 1, label: 'size', min: 1, max: 100, step: 1 },
          planeSegments: { value: 160, label: 'segments', min: 10, max: 1000, step: 1 },
          planeWireframe: { value: false, label: 'wireframe' },
          planeFlatShading: { value: false, label: 'flatShading' },
          planeShadows: { value: true, label: 'shadows' },
          planeMoundOffRatio: { value: 0.75, label: 'moundOffRatio', min: 0.01, max: 4.0, step: 0.01 },
          planeMoundOffAlpha: { value: 0.5, label: 'moundOffAlpha', min: 0, max: 1, step: 0.001 },
          planeMoundClearAlpha: { value: 1.00, label: 'moundClearAlpha', min: 0, max: 1, step: 0.001 }
        }
      )
    },
    {
      collapsed: true
    }
  );

  useEffect(() => { uniforms.uWaterLevel.value = waterLevel }, [ waterLevel ]);
  useEffect(() => { uniforms.uWaveSpeed.value = waveSpeed }, [ waveSpeed ]);
  useEffect(() => { uniforms.uWaveAmplitude.value = waveAmplitude }, [ waveAmplitude ]);
  useEffect(() => { uniforms.uFoamDepth.value = foamDepth }, [ foamDepth ]);

  const { planeGeometry, planeMaterial } = useMemo(() => {

    // Plane Geometry
    const planeGeometry = new PlaneGeometry(planeSize, planeSize, planeSegments, planeSegments);

    const planeMaterial = new MeshStandardMaterial({
      color: planeColor,
      wireframe: planeWireframe,
      roughness: planeRoughness,
      metalness: planeMetalness,
      displacementMap: displacementTexture,
      displacementScale: planeDisplacementScale,
      flatShading: planeFlatShading
    });

    planeMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uBaseColor = uniforms.uBaseColor;
      shader.uniforms.uGrassColor = uniforms.uGrassColor;
      shader.uniforms.uUnderwaterColor = uniforms.uUnderwaterColor;
      shader.uniforms.uWaterLevel = uniforms.uWaterLevel;
      shader.uniforms.uTime = uniforms.uTime;
      shader.uniforms.uWaveSpeed = uniforms.uWaveSpeed;
      shader.uniforms.uWaveAmplitude = uniforms.uWaveAmplitude;
      shader.uniforms.uFoamDepth = uniforms.uFoamDepth;

      shader.vertexShader = `
          uniform float uWaterLevel;
          uniform vec3 uBaseColor;
          uniform vec3 uGrassColor;
          uniform vec3 uUnderwaterColor;      
          uniform float uTime;
          uniform float uWaveSpeed;
          uniform float uWaveAmplitude;
          uniform float uFoamDepth;

          varying vec3 vColor;
          ${shader.vertexShader}
        `.replace(
          `#include <displacementmap_vertex>`,
          `
            #include <displacementmap_vertex>
  
            // Set the current color as the base color
            vec3 baseColor = uBaseColor;
        
            vec4 wPosition = modelMatrix * vec4(transformed, 1.0);
            float positionHeight = wPosition.y;        
        
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

            float stripe = smoothstep(currentWaterHeight + 0.01, currentWaterHeight - 0.01, wPosition.y) - smoothstep(currentWaterHeight + uFoamDepth + 0.01, currentWaterHeight + uFoamDepth - 0.01, wPosition.y);
            
            vec3 stripeColor = vec3(1.0, 1.0, 1.0); // White stripe
            
            // Apply the foam strip to baseColor    
            vec3 finalColor = mix(baseColor - stripe, stripeColor, stripe);
        
            // Output the final color
            vColor = finalColor;
          `
      );

      shader.fragmentShader = `
          varying vec3 vColor;
          ${shader.fragmentShader}
        `.replace(
          `#include <color_fragment>`,
          `
            #include <color_fragment>
            diffuseColor.rgb = vColor;
          `
      );
    }

    return { planeGeometry, planeMaterial };

  },
  [
    planeColor, planeMetalness, planeRoughness, planeDisplacementScale, planeSize, planeSegments, planeWireframe, planeFlatShading
  ]);

  useFrame(() => {
    /**
     * Displacement
     */
    displacementContext.globalCompositeOperation = 'source-over';
    displacementContext.globalAlpha = planeMoundClearAlpha;
    displacementContext.fillRect(0, 0, displacementCanvas.width, displacementCanvas.height)

    // Draw mounds
    displacementContext.globalAlpha = 1;
    displacementContext.drawImage(
      displacementMoundImage,
      0,
      0,
      displacementCanvas.width,
      displacementCanvas.width
    )

    // const numCells = 5;
    // const cellSize = displacementCanvas.width / numCells;
    // const moundOnSize = cellSize;
    // const moundOnOffset = (cellSize - moundOnSize) * 0.5;
    //
    // const moundOffSize = cellSize * planeMoundOffRatio;
    // const moundOffOffset = (cellSize - moundOffSize) * 0.5;
    // displacementContext.globalCompositeOperation = 'lighten';
    // mounds.forEach(mound => {
    //   const offset = mound.off ? moundOffOffset : moundOnOffset;
    //   const x = ((mound.x) * cellSize) + offset;
    //   const y = ((mound.y) * cellSize) + offset;
    //   const size = mound.off ? moundOffSize : moundOnSize
    //   displacementContext.globalAlpha = mound.off ? planeMoundOffAlpha : 1;
    //   displacementContext.drawImage(
    //     displacementMoundImage,
    //     x,
    //     y,
    //     size,
    //     size
    //   )
    // });

    // Texture
    displacementTexture.needsUpdate = true
  });

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime();
  })

  return <group dispose={null}>
    <mesh
      ref={planeMesh}
      position-y={positionY}
      rotation-x = {Math.PI * -0.5}
      castShadow={planeShadows}
      receiveShadow={planeShadows}
      geometry={planeGeometry}
      material={planeMaterial}
    />
    <mesh
      rotation-x={-Math.PI / 2}
      position={[0, (positionY - 0.01), 0]} // Moved it down to prevent the visual glitch from plane collision
      receiveShadow={true}
    >
      <planeGeometry args={[256, 256]} />
      <meshStandardMaterial
        color={underwaterColor}
        roughness={planeRoughness}
        metalness={planeMetalness}
      />
    </mesh>
  </group>
}
