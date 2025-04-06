import {Suspense} from 'react';
import {Canvas} from "@react-three/fiber";
import {Loader, OrbitControls, Sky} from "@react-three/drei";
import Debug from "./debug.tsx";
import Performance from "./performance.tsx";
import Lights from "./lights.tsx";
import Camera from "./camera.tsx";
import Island from "./island.tsx";
import Water from "./water.tsx";
import Fog from './fog.tsx';

export default function App() {
  return (
    <>
      <Debug />
      <Canvas
        shadows={true}
      >
        <Fog />
        <Sky sunPosition={[5, 5, -5]}/>
        <Performance />
        <Suspense>
          <OrbitControls />
          <Lights />
          <Camera />
          <Island />
          <Water />
        </Suspense>
      </Canvas>
      <Loader containerStyles={{ background: '#ffffff' }}/>
    </>
  );
}

