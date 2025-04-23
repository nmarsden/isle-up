import {Suspense, useEffect} from 'react';
import {Canvas} from "@react-three/fiber";
import {Loader, OrbitControls, Sky} from "@react-three/drei";
import Debug from "./debug.tsx";
import Performance from "./performance.tsx";
import Lights from "./lights.tsx";
import Camera from "./camera.tsx";
import Islands from "./islands.tsx";
import Water from "./water.tsx";
import Fog from './fog.tsx';
import { GlobalState, useGlobalStore } from '../stores/useGlobalStore.ts';
import Ui from './ui/ui.tsx';

export default function App() {
  const level = useGlobalStore((state: GlobalState) => state.level);
  const resetLevel = useGlobalStore((state: GlobalState) => state.resetLevel);

  useEffect(() => {
    // Temp: set level here
    setTimeout(() => resetLevel(level), 2000);
  }, []);
  
  return (
    <>
      <Debug />
      <Canvas
        shadows={true}
      >
        <Fog />
        <Sky
          sunPosition={[1, 0.5, -1]}
          turbidity={0.25}
        />
        <Performance />
        <Suspense>
          <OrbitControls 
            enableZoom={true}
            enablePan={false}
            minPolarAngle={0}
            maxPolarAngle={Math.PI * 0.45}
          />
          <Lights />
          <Camera />
          <Islands />
          <Water />
        </Suspense>
      </Canvas>
      <Ui />
      <Loader containerStyles={{ background: '#ffffff' }}/>
    </>
  );
}

