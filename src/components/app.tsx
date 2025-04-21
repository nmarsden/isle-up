import {Suspense} from 'react';
import {Canvas} from "@react-three/fiber";
import {Loader, OrbitControls, Sky} from "@react-three/drei";
import Debug from "./debug.tsx";
import Performance from "./performance.tsx";
import Lights from "./lights.tsx";
import Camera from "./camera.tsx";
import Islands from "./islands.tsx";
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
        <Sky
          sunPosition={[1, 0.5, -1]}
          turbidity={0.25}
        />
        <Performance />
        <Suspense>
          <OrbitControls />
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

