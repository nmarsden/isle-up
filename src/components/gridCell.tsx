import { useCallback, useEffect, useMemo, useRef } from "react";
import { Mesh, PlaneGeometry, ShaderMaterial, Vector3 } from "three";
import { CELL_WIDTH, GlobalState, toRowAndCol, useGlobalStore } from "../stores/useGlobalStore";
import gridVertexShader from "../shaders/grid/vertex.glsl";
import gridFragmentShader from "../shaders/grid/fragment.glsl";

export default function GridCell({ id }: { id: number }) {
  const setHovered = useGlobalStore((state: GlobalState) => state.setHovered);
  const toggleUp = useGlobalStore((state: GlobalState) => state.toggleUp);
  const hoveredIds = useGlobalStore((state: GlobalState) => state.hoveredIds);

  const meshRef = useRef<(Mesh)>(null!);

  const onClicked = useCallback((id: number) => toggleUp(id), []);
  const onPointerOver = useCallback((id: number) => setHovered(id, true), []);
  const onPointerOut = useCallback((id: number) => setHovered(id, false), []);

  const { position, geometry, material, uniforms } = useMemo(() => {

    /* Position */
    const { row, col } = toRowAndCol(id);
    const x = col * CELL_WIDTH - (2 * CELL_WIDTH);
    const y = 0.5;
    const z = row * CELL_WIDTH - (2 * CELL_WIDTH);
    const position = new Vector3(x, y, z);

    /* Geometry */
    const geometry = new PlaneGeometry();
    geometry.rotateX(Math.PI * -0.5);
    geometry.scale(CELL_WIDTH, 1, CELL_WIDTH);

    /* Uniforms */
    const uniforms = {
      uHovered: { value: 0 }
    }

    /* Material */
    const material = new ShaderMaterial({
        vertexShader: gridVertexShader,
        fragmentShader: gridFragmentShader,
        depthTest: false,
        depthWrite: false,
        transparent: true,
        uniforms: uniforms,
    });

    return { position, geometry, material, uniforms };
  }, []);

  useEffect(() => { uniforms.uHovered.value = hoveredIds.includes(id) ? 1 : 0 }, [ hoveredIds ]);  

  return (
    <mesh 
      ref={meshRef} 
      key={`grid-${id}`}
      scale={0.98}
      position={position}
      geometry={geometry}
      material={material}
      onClick={() => onClicked(id)}
      onPointerOver={() => onPointerOver(id)}
      onPointerOut={() => onPointerOut(id)}
    />
  )
}