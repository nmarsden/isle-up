import {Suspense} from 'react';
import {Canvas} from "@react-three/fiber";
import {Loader, OrbitControls} from "@react-three/drei";
import Debug from "./debug.tsx";
import Performance from "./performance.tsx";
import Lights from "./lights.tsx";
import Camera from "./camera.tsx";
import Island from "./island.tsx";

export default function App() {
    return (
      <>
        <Debug />
        <Canvas
          shadows={true}
        >
          <Performance />
          <Suspense>
            <OrbitControls />
            <Lights />
            <Camera />
            <Island />
          </Suspense>
        </Canvas>
        <Loader containerStyles={{ background: '#ffffff' }}/>
      </>
    );
}

