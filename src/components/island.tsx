import {useCallback, useEffect, useMemo, useRef} from "react";
import {Color, InstancedMesh, Matrix4, Mesh, MeshStandardMaterial, Object3D, PlaneGeometry} from "three";
import {useFrame} from "@react-three/fiber";
import {folder, useControls} from "leva";
import {GlobalState, useGlobalStore} from "../stores/useGlobalStore.ts";
import {useGLTF} from "@react-three/drei";

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

const glsl = (x: any) => x;

const CELL_WIDTH = 12.25;
const NUM_CELLS = 25;
const temp = new Object3D()

const gridState = [
  [1, 1, 0, 1, 1],
  [1, 1, 1, 1, 1],
  [1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1]
];

export default function Island() {
  const clickableInstancedMeshRef = useRef<InstancedMesh>(null);
  useEffect(() => {
    if (!clickableInstancedMeshRef.current) return;
    // Set positions
    for (let i = 0; i < NUM_CELLS; i++) {
      const row = Math.floor(i / 5);
      const column = (i % 5);

      const x = column * CELL_WIDTH - (2 * CELL_WIDTH);
      const y = 2;
      const z = row * CELL_WIDTH - (2 * CELL_WIDTH);

      temp.position.set(x, y, z);
      temp.updateMatrix();
      clickableInstancedMeshRef.current.setMatrixAt(i, temp.matrix);
    }
    // Update the instance
    clickableInstancedMeshRef.current.instanceMatrix.needsUpdate = true
  }, [])


  const islandInstancedMeshRef = useRef<InstancedMesh>(null);
  useEffect(() => {
    if (!islandInstancedMeshRef.current) return;
    // Set positions
    for (let i = 0; i < NUM_CELLS; i++) {
      const row = Math.floor(i / 5);
      const column = (i % 5);

      const isUp = gridState[row][column];

      const x = column * CELL_WIDTH - (2 * CELL_WIDTH);
      const y = isUp ? -0.01 : -1.2;
      const z = row * CELL_WIDTH - (2 * CELL_WIDTH);

      // console.log(x, z);

      temp.position.set(x, y, z);
      temp.updateMatrix();
      islandInstancedMeshRef.current.setMatrixAt(i, temp.matrix);
    }
    // Update the instance
    islandInstancedMeshRef.current.instanceMatrix.needsUpdate = true
  }, [])
    
  const onClicked = useCallback((event: any) => {
    if (!islandInstancedMeshRef.current) return;

    const i = event.instanceId;

    const row = Math.floor(i / 5);
    const column = (i % 5);

    const isUp = gridState[row][column] === 1;
    gridState[row][column] = isUp ? 0 : 1;

    const x = column * CELL_WIDTH - (2 * CELL_WIDTH);
    const y = isUp ? -1.2 : -0.01;
    const z = row * CELL_WIDTH - (2 * CELL_WIDTH);

    temp.position.set(x, y, z);
    temp.updateMatrix();
    islandInstancedMeshRef.current.setMatrixAt(i, temp.matrix);
    islandInstancedMeshRef.current.instanceMatrix.needsUpdate = true;
  }, []);
  
  const { nodes } = useGLTF('models/terrain2.glb', false);

  const waterLevel = useGlobalStore((state: GlobalState) => state.waterLevel);
  const waveSpeed = useGlobalStore((state: GlobalState) => state.waveSpeed);
  const waveAmplitude = useGlobalStore((state: GlobalState) => state.waveAmplitude);
  const foamDepth = useGlobalStore((state) => state.foamDepth)

  const {
    underwaterColor, planeMetalness, planeRoughness, planeWireframe, planeFlatShading, islandShadows
  } = useControls(
    'Island',
    {
      'Plane': folder(
        {
          sandBaseColor: { value: "#ff9900", label: "Sand", onChange: (value) => { uniforms.uBaseColor.value = new Color(value); } },
          grassColor: { value: "yellow", label: "Grass", onChange: (value) => { uniforms.uGrassColor.value = new Color(value); } },
          underwaterColor: { value: "#118a4f", label: "Underwater", transient: false, onChange: (value) => { uniforms.uUnderwaterColor.value = new Color(value); } },
          planeMetalness: { value: 0.0, label: 'metalness', min: 0, max: 1, step: 0.01 },
          planeRoughness: { value: 0.7, label: 'roughness', min: 0, max: 1, step: 0.01 },
          planeWireframe: { value: false, label: 'wireframe' },
          planeFlatShading: { value: false, label: 'flatShading' },
          islandShadows: { value: false, label: 'shadows' },
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

  const { clickableGeometry, clickableMaterial, islandGeometry, islandMaterial } = useMemo(() => {

    // -- Clickables --
    const clickableGeometry = new PlaneGeometry();
    clickableGeometry.rotateX(Math.PI * -0.5);
    clickableGeometry.scale(CELL_WIDTH, 1, CELL_WIDTH);
    const clickableMaterial = new MeshStandardMaterial();
    clickableMaterial.wireframe = true;

    // -- Islands --
    const islandGeometry = (nodes['Terrain-02'] as Mesh).geometry;

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
          uniform vec3 uBaseColor;
          uniform vec3 uGrassColor;
          uniform vec3 uUnderwaterColor;      
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

            float stripe = smoothstep(currentWaterHeight + 0.01, currentWaterHeight - 0.01, vPosition.y) - 
                           smoothstep(currentWaterHeight + uFoamDepth + 0.01, currentWaterHeight + uFoamDepth - 0.01, vPosition.y);
            
            vec3 stripeColor = vec3(1.0, 1.0, 1.0); // White stripe
            
            // Apply the foam strip to baseColor    
            vec3 finalColor = mix(baseColor - stripe, stripeColor, stripe);
            
            diffuseColor.rgb = finalColor;
          `
      );
    }

    return { clickableGeometry, clickableMaterial, islandGeometry, islandMaterial };
  },
  [
    nodes, planeMetalness, planeRoughness, planeWireframe, planeFlatShading
  ]);

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime();
  })

  return <group dispose={null}>
    {/* Clickables */}
    <instancedMesh 
      ref={clickableInstancedMeshRef} 
      args={[undefined, undefined, NUM_CELLS]}
      geometry={clickableGeometry}
      material={clickableMaterial}
      onClick={onClicked}
    />
    {/* Islands */}
    <instancedMesh 
      ref={islandInstancedMeshRef} 
      args={[undefined, undefined, NUM_CELLS]}
      geometry={islandGeometry}
      material={islandMaterial}
      castShadow={islandShadows}
      receiveShadow={islandShadows}
    />
    {/* Underwater Ground Plane */}
    <mesh
      rotation-x={-Math.PI / 2}
      receiveShadow={true}
      visible={true}
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

useGLTF.preload('models/terrain2.glb', false)
