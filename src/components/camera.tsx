import {PerspectiveCamera} from "@react-three/drei";
import {useControls} from "leva";
import {ReactNode} from "react";

export default function Camera({ children } : { children?: ReactNode }) {
  const {
    positionY,
    positionZ
  } = useControls(
    'Camera',
    {
      positionY: { value: 5, label: 'positionY', min: 0, max: 100, step: 0.1 },
      positionZ: { value: 5, label: 'positionZ', min: 0, max: 100, step: 0.1 }
    },
    {
      collapsed: true
    }
  );

  return (
    <PerspectiveCamera
      makeDefault={true}
      fov={45}
      near={0.1}
      far={200}
      position={[0, positionY, positionZ]}
    >
      { children }
    </PerspectiveCamera>
  );
}
