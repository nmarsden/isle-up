import {folder, useControls} from "leva";
import {useRef} from "react";
import {DirectionalLight} from "three";

export default function Lights() {
  const directionalLight = useRef<DirectionalLight>(null!);

  const {
    ambientColor, ambientIntensity,
    directionalColor, directionalIntensity, directionalPosition,
  } = useControls(
    'Lights',
    {
      'Ambient': folder(
        {
          ambientColor: {value: 'white', label: 'color'},
          ambientIntensity: {value: 2, min: 0, max: 10, step: 0.1, label: 'intensity'}
        }
      ),
      'Directional': folder(
        {
          directionalColor: {value: 'white', label: 'color'},
          directionalIntensity: {value: 2, min: 0, max: 10, step: 0.1, label: 'intensity'},
          directionalPosition: {value: [26, 13, -26], label: 'position'},
        }
      )
    },
    {
      collapsed: true
    }
  );

  // useShadowHelper(directionalLight, directionalShadowHelperEnabled);

  return <>
    <ambientLight
      color={ambientColor}
      intensity={ambientIntensity}
    />
    <directionalLight
      ref={directionalLight}
      color={directionalColor}
      intensity={directionalIntensity}
      position={directionalPosition}

      shadow-mapSize-width={512}
      shadow-mapSize-height={512}

      shadow-camera-top={18}
      shadow-camera-bottom={-12}
      shadow-camera-left={-40}
      shadow-camera-right={40}

      shadow-camera-near={0.1}
      shadow-camera-far={100}      

      castShadow={true}
    />
  </>
}
