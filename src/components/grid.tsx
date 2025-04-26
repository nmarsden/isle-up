import { useCallback, useEffect, useMemo, useRef } from "react";
import { InstancedMesh, MeshStandardMaterial, Object3D, PlaneGeometry } from "three";
import { CELL_WIDTH, GlobalState, NUM_CELLS, useGlobalStore } from "../stores/useGlobalStore";

export default function Grid() {
  const setHovered = useGlobalStore((state: GlobalState) => state.setHovered);
  const toggleUp = useGlobalStore((state: GlobalState) => state.toggleUp);

  const clickableInstancedMeshRef = useRef<InstancedMesh>(null);
  
  useEffect(() => {
    if (!clickableInstancedMeshRef.current) return;
    // Set positions
    const temp = new Object3D();

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
    clickableInstancedMeshRef.current.computeBoundingSphere();
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

  const { clickableGeometry, clickableMaterial } = useMemo(() => {

    const clickableGeometry = new PlaneGeometry();
    clickableGeometry.rotateX(Math.PI * -0.5);
    clickableGeometry.scale(CELL_WIDTH, 1, CELL_WIDTH);

    const clickableMaterial = new MeshStandardMaterial();
    clickableMaterial.wireframe = true;
    // clickableMaterial.wireframe = false;
    clickableMaterial.transparent = true;
    clickableMaterial.opacity = 1;
    // clickableMaterial.opacity = 0;
    clickableMaterial.depthTest = false;

    return { clickableGeometry, clickableMaterial };
  }, []);

  return (
    <group dispose={null}>
      <instancedMesh 
        ref={clickableInstancedMeshRef} 
        args={[undefined, undefined, NUM_CELLS]}
        geometry={clickableGeometry}
        material={clickableMaterial}
        onClick={onClicked}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      />
    </group>
  )
}