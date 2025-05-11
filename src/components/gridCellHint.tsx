import { useEffect, useMemo, useRef } from "react";
import { Vector3 } from "three";
import { CELL_WIDTH, GlobalState, toRowAndCol, useGlobalStore } from "../stores/useGlobalStore";
import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export default function GridCellHint() {
  const showHint = useGlobalStore((state: GlobalState) => state.showHint);

  const hintRef = useRef<typeof Line | null>(null!);

  useEffect(() => {
    if (!hintRef.current) return;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    hintRef.current.visible = showHint;

  }, [ showHint ]);

  const { position, linePoints } = useMemo(() => {

    /* Plane Position */
    const hintId = 12
    const { row, col } = toRowAndCol(hintId);
    const x = col * CELL_WIDTH - (2 * CELL_WIDTH);
    const y = 0.0;
    const z = row * CELL_WIDTH - (2 * CELL_WIDTH);
    const position: [number, number, number] = [x, y, z];

    /* Line Points */
    const linePoints = []
    linePoints.push(new Vector3(-0.5, 0, -0.5));
    linePoints.push(new Vector3(-0.5, 0, 0.5));
    linePoints.push(new Vector3(0.5, 0, 0.5));
    linePoints.push(new Vector3(0.5, 0, -0.5));
    linePoints.push(new Vector3(-0.5, 0, -0.5));
    linePoints.forEach(point => {
      point.multiplyScalar(CELL_WIDTH * 0.96);
      point.add({ x: 0, y: y + 0.2, z: 0 });
    })

    return { position, linePoints };
  }, []);

  useFrame(({ clock }) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    if (!hintRef.current || !hintRef.current.visible) return;

    const scale = 1.0 + (-0.05 * Math.sin(Math.PI * clock.elapsedTime * 2.0));
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    hintRef.current.scale.set(scale, 1, scale);
  });
  
  return (
    <Line
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      ref={hintRef} 
      position={position}
      points={linePoints}
      lineWidth={0.7}
      worldUnits={true}
    />
  )
}