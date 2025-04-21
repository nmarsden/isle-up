import {useCallback, useEffect, useMemo, useRef} from "react";
import {InstancedMesh, MeshStandardMaterial, Object3D, PlaneGeometry} from "three";
import {useControls} from "leva";
import {CELL_WIDTH, GlobalState, useGlobalStore, Y_DOWN, Y_UP} from "../stores/useGlobalStore.ts";
import Tree from "./tree.tsx";
import Island from "./island.tsx";

const NUM_CELLS = 25;
const temp = new Object3D()

export default function Islands() {
  const upIds = useGlobalStore((state: GlobalState) => state.upIds);  
  const setHovered = useGlobalStore((state: GlobalState) => state.setHovered);
  const toggleUp = useGlobalStore((state: GlobalState) => state.toggleUp);

  const clickableInstancedMeshRef = useRef<InstancedMesh>(null);
  useEffect(() => {
    if (!clickableInstancedMeshRef.current) return;
    // Set positions
    for (let i = 0; i < NUM_CELLS; i++) {
      const row = Math.floor(i / 5);
      const column = (i % 5);

      const x = column * CELL_WIDTH - (2 * CELL_WIDTH);
      const y = 0.5;
      const z = row * CELL_WIDTH - (2 * CELL_WIDTH);

      temp.position.set(x, y, z);
      temp.updateMatrix();
      clickableInstancedMeshRef.current.setMatrixAt(i, temp.matrix);
    }
    // Update the instance
    clickableInstancedMeshRef.current.instanceMatrix.needsUpdate = true
  }, [])

  const onClicked = useCallback((event: any) => {
    toggleUp(event.instanceId);
  }, []);

  const onPointerOver = useCallback((event: any) => {
    setHovered(event.instanceId, true);
  }, []);

  const onPointerOut = useCallback((event: any) => {
    setHovered(event.instanceId, false);
  }, []);

  const {
    underwaterColor, planeMetalness, planeRoughness
  } = useControls(
    'Underwater',
    {
      underwaterColor: { value: "#118a4f", label: "Underwater" },
      planeMetalness: { value: 0.0, label: 'metalness', min: 0, max: 1, step: 0.01 },
      planeRoughness: { value: 0.7, label: 'roughness', min: 0, max: 1, step: 0.01 }
    },
    {
      collapsed: true
    }
  );

  const { clickableGeometry, clickableMaterial, islandPositions } = useMemo(() => {

    // -- Clickables --
    const clickableGeometry = new PlaneGeometry();
    clickableGeometry.rotateX(Math.PI * -0.5);
    clickableGeometry.scale(CELL_WIDTH, 1, CELL_WIDTH);
    const clickableMaterial = new MeshStandardMaterial();
    clickableMaterial.wireframe = false;
    clickableMaterial.transparent = true;
    clickableMaterial.opacity = 0;
    clickableMaterial.depthTest = false;

    // -- Island Positions --
    const islandPositions: [number, number, number][] = [];
    for (let i=0; i<NUM_CELLS; i++) {
      const row = Math.floor(i / 5);
      const column = (i % 5);
  
      const isUp = upIds.includes(i);
  
      const x = column * CELL_WIDTH - (2 * CELL_WIDTH);
      const y = isUp ? Y_UP : Y_DOWN;
      const z = row * CELL_WIDTH - (2 * CELL_WIDTH);
  
      islandPositions.push([x, y, z]);
    }

    return { clickableGeometry, clickableMaterial, islandPositions };
  }, [ upIds ]);

  return <group dispose={null}>
    {/* Clickables */}
    <instancedMesh 
      ref={clickableInstancedMeshRef} 
      args={[undefined, undefined, NUM_CELLS]}
      geometry={clickableGeometry}
      material={clickableMaterial}
      onClick={onClicked}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    />
    {/* Islands */}
    {islandPositions.map((position, index) => (
      <Island id={index} position={position} key={`island-${index}`}>
        <Tree id={index} />
      </Island>
    ))}
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
