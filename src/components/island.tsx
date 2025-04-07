import {useMemo, useRef} from "react";
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

export default function Island() {
  const waterLevel = useGlobalStore((state: GlobalState) => state.waterLevel);
  const waveSpeed = useGlobalStore((state: GlobalState) => state.waveSpeed);
  const waveAmplitude = useGlobalStore((state: GlobalState) => state.waveAmplitude);

  const planeMesh = useRef<Mesh>(null!);

  const {
    SAND_BASE_COLOR, GRASS_BASE_COLOR, UNDERWATER_BASE_COLOR,
    planeColor, planeMetalness, planeRoughness, positionY, planeDisplacementScale, planeSize, planeSegments, planeWireframe, planeFlatShading, planeShadows, planeMoundClearAlpha
  } = useControls(
    'Island',
    {
      'Plane': folder(
        {
          SAND_BASE_COLOR: { value: "#ff9900", label: "Sand" },
          GRASS_BASE_COLOR: { value: "#85a02b", label: "Grass" },
          UNDERWATER_BASE_COLOR: { value: "#118a4f", label: "Underwater" },
          positionY: { value: 0, label: 'positionY', min: -10, max: 10, step: 0.05 },
          planeColor: {value: '#f8ed3b', label: 'color'},
          planeMetalness: { value: 0.0, label: 'metalness', min: 0, max: 1, step: 0.01 },
          planeRoughness: { value: 0.7, label: 'roughness', min: 0, max: 1, step: 0.01 },
          planeDisplacementScale: { value: 5, label: 'displacementScale', min: 0, max: 10, step: 0.1 },
          planeSize: { value: 5, label: 'size', min: 1, max: 100, step: 1 },
          planeSegments: { value: 100, label: 'segments', min: 10, max: 1000, step: 1 },
          planeWireframe: { value: false, label: 'wireframe' },
          planeFlatShading: { value: true, label: 'flatShading' },
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

  // Convert color hex values to Three.js Color objects
  const SAND_COLOR = useMemo(() => new Color(SAND_BASE_COLOR), [SAND_BASE_COLOR]);
  const GRASS_COLOR = useMemo(() => new Color(GRASS_BASE_COLOR), [GRASS_BASE_COLOR]);
  const UNDERWATER_COLOR = useMemo(() => new Color(UNDERWATER_BASE_COLOR), [UNDERWATER_BASE_COLOR]);

  const uniforms = useMemo(() => {
    return {
      uBaseColor: SAND_COLOR,
      uGrassColor: GRASS_COLOR,
      uUnderwaterColor: UNDERWATER_COLOR,
      uWaterLevel: waterLevel,
      uWaveSpeed: waveSpeed,
      uWaveAmplitude: waveAmplitude
    };
  }, [ SAND_COLOR, GRASS_COLOR, UNDERWATER_COLOR, waterLevel, waveSpeed, waveAmplitude ]);

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
      shader.uniforms.uBaseColor = { value: uniforms.uBaseColor };
      shader.uniforms.uGrassColor = { value: uniforms.uGrassColor };
      shader.uniforms.uUnderwaterColor = { value: uniforms.uUnderwaterColor };
      shader.uniforms.uWaterLevel = { value: uniforms.uWaterLevel };
      shader.uniforms.uWaveSpeed = { value: uniforms.uWaveSpeed };
      shader.uniforms.uWaveAmplitude = { value: uniforms.uWaveAmplitude }

      shader.vertexShader = `
          uniform float uWaterLevel;
          uniform vec3 uBaseColor;
          uniform vec3 uGrassColor;
          uniform vec3 uUnderwaterColor;      
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
        
            // Darken the base color at lower Y values to simulate wet sand
            float heightFactor = smoothstep(uWaterLevel + 1.0, uWaterLevel, positionHeight);
            baseColor = mix(baseColor, baseColor * 0.5, heightFactor);
        
            // Blend underwater color with base planeMesh to add depth to the ocean bottom
            float oceanFactor = smoothstep(min(uWaterLevel - 0.4, 0.2), 0.0, positionHeight);
            baseColor = mix(baseColor, uUnderwaterColor, oceanFactor);
        
            // Add grass to the higher areas of the terrain
            float grassFactor = smoothstep(uWaterLevel + 0.8, max(uWaterLevel + 1.6, 3.0), positionHeight);
            baseColor = mix(baseColor, uGrassColor, grassFactor);
        
            // Output the final color
            vColor = baseColor;
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
    uniforms.uBaseColor, uniforms.uUnderwaterColor, uniforms.uWaterLevel, uniforms.uWaveAmplitude, uniforms.uWaveSpeed, uniforms.uGrassColor,
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
        color={UNDERWATER_BASE_COLOR}
        roughness={planeRoughness}
        metalness={planeMetalness}
      />
    </mesh>
  </group>
}
