import {useMemo} from "react";
import {useControls} from "leva";
import {GlobalState, NUM_CELLS, useGlobalStore} from "../stores/useGlobalStore.ts";
import Tree from "./tree.tsx";
import Island from "./island.tsx";
import Barrel from "./barrel.tsx";
import Boat from "./boat.tsx";
import Chest from "./chest.tsx";

export default function Islands() {
  const underwaterColor = useGlobalStore((state: GlobalState) => state.underwaterColor);

  const {
    planeMetalness, planeRoughness
  } = useControls(
    'Underwater',
    {
      planeMetalness: { value: 0.0, label: 'metalness', min: 0, max: 1, step: 0.01 },
      planeRoughness: { value: 0.7, label: 'roughness', min: 0, max: 1, step: 0.01 }
    },
    {
      collapsed: true
    }
  );

  const { islandIds } = useMemo(() => {

    const islandIds = new Array(NUM_CELLS).fill(0).map((_, index) => index);

    return { islandIds };
  }, []);

  return <group dispose={null}>
    {/* Islands */}
    {islandIds.map((id) => (
      <Island id={id} key={`island-${id}`}>
        <Barrel id={id} />
        <Boat id={id} />
        <Chest id={id} />
        <Tree id={id} />
      </Island>
    ))}
    {/* Underwater Ground Plane */}
    <mesh
      visible={true}
      position-y={0.0}
      rotation-x={-Math.PI / 2}
      receiveShadow={false}
    >
      <planeGeometry args={[1000, 1000]} />
      <meshStandardMaterial
        color={underwaterColor}
        roughness={planeRoughness}
        metalness={planeMetalness}
        depthWrite={false}
      />
    </mesh>
  </group>
}
