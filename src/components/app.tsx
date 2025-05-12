import {Suspense} from 'react';
import {Canvas} from "@react-three/fiber";
import {Loader, Sky} from "@react-three/drei";
import Debug from "./debug.tsx";
import Performance from "./performance.tsx";
import Lights from "./lights.tsx";
import Camera from "./camera.tsx";
import Grid from './grid.tsx';
import Islands from "./islands.tsx";
import Water from "./water.tsx";
import Fog from './fog.tsx';
import Ui from './ui/ui.tsx';
import Sounds from './sounds.tsx';

export default function App() {
  return (
    <>
      <Debug />
      <Canvas
        shadows={true}
      >
        <Suspense>
          <Fog />
          <Sky
            sunPosition={[1, 0.5, -1]}
            turbidity={0.25}
          />
          <Performance />
          <Lights />
          <Camera />
          <Grid />
          <Islands />
          <Water />
          <Sounds />
        </Suspense>
      </Canvas>
      <Ui />
      <Loader containerStyles={{ background: '#07046380' }}/>
    </>
  );
}

