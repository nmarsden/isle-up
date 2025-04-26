import { useEffect, useMemo, useState } from "react";
import { GlobalState, NUM_CELLS, useGlobalStore } from "../stores/useGlobalStore";
import GridCell from "./gridCell";
import { useCursor } from "@react-three/drei";

export default function Grid() {
  const hoveredIds = useGlobalStore((state: GlobalState) => state.hoveredIds);
  const [hovered, setHovered] = useState(false);

  useCursor(hovered)

  const ids = useMemo(() => new Array(NUM_CELLS).fill(0).map((_, index) => index), []);

  useEffect(() => setHovered(hoveredIds.length > 0), [ hoveredIds ]);

  return (
    <group dispose={null}>
      {ids.map((id) => <GridCell id={id} key={`grid-${id}`} />)}
    </group>
  )
}