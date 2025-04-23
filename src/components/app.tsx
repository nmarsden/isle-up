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

export default function App() {
  const setLevel = useGlobalStore((state: GlobalState) => state.setLevel);

  useEffect(() => {
    // Temp: set level here
    setTimeout(() => setLevel(0), 2000);
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
            enableZoom={false}
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
      <Loader containerStyles={{ background: '#ffffff' }}/>
    </>
  );
}

