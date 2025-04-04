import {PerspectiveCamera} from "@react-three/drei";
import {useControls} from "leva";
import {ReactNode} from "react";

export default function Camera({ children } : { children?: ReactNode }) {
  const {
    positionZ
  } = useControls(
    'Camera',
    {
      positionZ: { value: 30, label: 'positionZ', min: 0, max: 100, step: 0.1 }
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
      position={[0, 0, positionZ]}
    >
      { children }
    </PerspectiveCamera>
  );
}
