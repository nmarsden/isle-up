import { useMemo } from "react";
import { NUM_CELLS } from "../stores/useGlobalStore";
import GridCell from "./gridCell";

export default function Grid() {
  const ids = useMemo(() => new Array(NUM_CELLS).fill(0).map((_, index) => index), []);

  return (
    <group dispose={null}>
      {ids.map((id) => <GridCell id={id} key={`grid-${id}`} />)}
    </group>
  )
}