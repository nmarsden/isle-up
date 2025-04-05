import {folder, useControls} from "leva";
import {useEffect, useRef} from "react";
import {DirectionalLight} from "three";

export default function Lights() {
  const directionalLight = useRef<DirectionalLight>(null!);

  const {
    ambientColor, ambientIntensity,
    directionalColor, directionalIntensity, directionalPosition, directionalShadowNormalBias, directionalShadowBias
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
          directionalPosition: {value: [5, 5, -5], label: 'position'},
          directionalShadowNormalBias: {value: 0.08, min: 0, max: 1, step: 0.01, label: 'shadowNormalBias'},
          directionalShadowBias: {value: 0.0, min: 0, max: 1, step: 0.01, label: 'shadowBias'},
        }
      )
    },
    {
      collapsed: true
    }
  );

  useEffect(() => {
    directionalLight.current.shadow.normalBias = directionalShadowNormalBias;
    directionalLight.current.shadow.bias = directionalShadowBias * 0.1;

  }, [directionalLight, directionalShadowNormalBias, directionalShadowBias]);

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
      castShadow={true}
    />
  </>
}
