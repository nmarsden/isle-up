import {PerspectiveCamera} from "@react-three/drei";
import {useControls} from "leva";
import {ReactNode} from "react";

export default function Camera({ children } : { children?: ReactNode }) {
  const {
    fov,
    positionY,
    positionZ
  } = useControls(
    'Camera',
    {
      fov: { value: 90, label: 'fov', min: 0, max: 100, step: 0.1 },
      positionY: { value: 50, label: 'positionY', min: 0, max: 200, step: 0.1 },
      positionZ: { value: 50, label: 'positionZ', min: 0, max: 100, step: 0.1 }
    },
    {
      collapsed: true
    }
  );

  return (
    <PerspectiveCamera
      makeDefault={true}
      fov={fov}
      near={0.1}
      far={200}
      position={[0, positionY, positionZ]}
    >
      { children }
    </PerspectiveCamera>
  );
}
