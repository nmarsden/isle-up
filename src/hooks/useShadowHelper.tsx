import { useFrame, useThree } from '@react-three/fiber';
import React, {RefObject, useRef} from 'react';
import { CameraHelper, Light } from 'three';

export default function useShadowHelper(ref: RefObject<Light | undefined>, enabled: boolean) {

  const helper = useRef<CameraHelper>(null!);
  const scene = useThree((state) => state.scene);

  React.useEffect(() => {
    if (!enabled) return;
    if (!ref.current) return;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    helper.current = new CameraHelper(ref.current?.shadow.camera);
    if (helper.current) {
      scene.add(helper.current);
    }

    return () => {
      if (helper.current) {
        scene.remove(helper.current);
      }
    };
  }, [ref, helper.current?.uuid, scene]);

  useFrame(() => {
    if (helper.current?.update) {
      helper.current.update();
    }
  });
}
