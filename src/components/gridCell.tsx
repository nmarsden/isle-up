import { useCallback, useEffect, useMemo, useRef } from "react";
import { Mesh, MeshBasicMaterial, PlaneGeometry, Vector3 } from "three";
import { CELL_WIDTH, GlobalState, toRowAndCol, useGlobalStore } from "../stores/useGlobalStore";
import { Line } from "@react-three/drei";
import { LineMaterial } from "three/examples/jsm/Addons.js";

export default function GridCell({ id }: { id: number }) {
  const setHovered = useGlobalStore((state: GlobalState) => state.setHovered);
  const toggleUp = useGlobalStore((state: GlobalState) => state.toggleUp);
  const hoveredIds = useGlobalStore((state: GlobalState) => state.hoveredIds);

  const meshRef = useRef<Mesh>(null!);
  const lineRef = useRef<typeof Line | null>(null!);
  
  const onClicked = useCallback((id: number) => toggleUp(id), []);
  const onPointerOver = useCallback((id: number) => setHovered(id, true), []);
  const onPointerOut = useCallback((id: number) => setHovered(id, false), []);

  const { planeGeometry, planeMaterial, linePoints, lineMaterial } = useMemo(() => {

    /* Plane Position */
    const { row, col } = toRowAndCol(id);
    const x = col * CELL_WIDTH - (2 * CELL_WIDTH);
    const y = 0.0;
    const z = row * CELL_WIDTH - (2 * CELL_WIDTH);

    /* Plane Geometry */
    const planeGeometry = new PlaneGeometry();
    planeGeometry.rotateX(Math.PI * -0.5);
    planeGeometry.scale(CELL_WIDTH, 1, CELL_WIDTH);
    planeGeometry.translate(x, y, z);

    /* Plane Material */
    const planeMaterial = new MeshBasicMaterial({
        wireframe: false,
        depthTest: false,
        depthWrite: false,
        transparent: true,
        opacity: 0
    });

    /* Line Points */
    const linePoints = []
    linePoints.push(new Vector3(-0.5, 0, -0.5));
    linePoints.push(new Vector3(-0.5, 0, 0.5));
    linePoints.push(new Vector3(0.5, 0, 0.5));
    linePoints.push(new Vector3(0.5, 0, -0.5));
    linePoints.push(new Vector3(-0.5, 0, -0.5));
    linePoints.forEach(point => {
      point.multiplyScalar(CELL_WIDTH * 0.96);
      point.add({ x, y: y + 0.1, z });
    })

    const lineMaterial = new LineMaterial();
    lineMaterial.linewidth = 1;

    return { planeGeometry, planeMaterial, linePoints, lineMaterial };
  }, []);

  useEffect(() => { 
    if (!lineRef.current) return;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    lineRef.current.visible = hoveredIds.includes(id);

  }, [ hoveredIds ]);  

  return (
    <>
      {/* Plane */}
      <mesh 
        ref={meshRef} 
        key={`grid-${id}`}
        geometry={planeGeometry}
        material={planeMaterial}
        onClick={() => onClicked(id)}
        onPointerOver={() => onPointerOver(id)}
        onPointerOut={() => onPointerOut(id)}
      />
      {/* Line */}
      <Line
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        ref={lineRef} 
        points={linePoints}
        material={lineMaterial}
      />
    </>
  )
}