import {CameraControls, PerspectiveCamera} from "@react-three/drei";
import {useControls} from "leva";
import {ReactNode, useEffect, useRef} from "react";
import { GlobalState, useGlobalStore } from "../stores/useGlobalStore";
import { Vector3 } from "three";

const ORIGIN_TARGET = new Vector3(0, 0, 0);
const LEVEL_COMPLETED_POSITION = new Vector3(0, 15, 10);
const LEVEL_COMPLETED_TARGET = new Vector3(0, 15, 0);

export default function Camera({ children } : { children?: ReactNode }) {
  const cameraControls = useRef<CameraControls>(null!);
  const levelCompleted = useGlobalStore((state: GlobalState) => state.levelCompleted);
  const target = useRef<Vector3>(ORIGIN_TARGET);
  const cameraPosition = useRef<Vector3>(new Vector3());
  
  useEffect(() => {
    if (levelCompleted && target.current.equals(ORIGIN_TARGET)) {
      target.current = LEVEL_COMPLETED_TARGET;
      cameraControls.current.getPosition(cameraPosition.current);
      cameraControls.current.setPosition(LEVEL_COMPLETED_POSITION.x, LEVEL_COMPLETED_POSITION.y, LEVEL_COMPLETED_POSITION.z, true);
      cameraControls.current.setTarget(LEVEL_COMPLETED_TARGET.x, LEVEL_COMPLETED_TARGET.y, LEVEL_COMPLETED_TARGET.z, true);
    } else if (!levelCompleted && target.current.equals(LEVEL_COMPLETED_TARGET)) {
      target.current = ORIGIN_TARGET;
      cameraControls.current.setPosition(cameraPosition.current.x, cameraPosition.current.y, cameraPosition.current.z, true);
      cameraControls.current.setTarget(ORIGIN_TARGET.x, ORIGIN_TARGET.y, ORIGIN_TARGET.z, true);
    }
  }, [levelCompleted]);
  
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
    <>
      <PerspectiveCamera
        makeDefault={true}
        fov={fov}
        near={0.1}
        far={200}
        position={[0, positionY, positionZ]}
        rotation-x={Math.PI * -0.25}
      >
        { children }
      </PerspectiveCamera>
      <CameraControls 
        ref={cameraControls}
        truckSpeed={0}
        minPolarAngle={0}
        maxPolarAngle={Math.PI * 0.45}
        minDistance={5.0}
        maxDistance={71.0}
        draggingSmoothTime={0.3}
      />
    </>
  );
}
