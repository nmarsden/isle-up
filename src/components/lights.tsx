import {folder, useControls} from "leva";

export default function Lights() {
  const {
    ambientColor, ambientIntensity,
    directionalColor, directionalIntensity, directionalPosition
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
          directionalPosition: {value: [0, -2, 5], label: 'position'}
        }
      )
    },
    {
      collapsed: true
    }
  );

  return <>
    <ambientLight
      color={ambientColor}
      intensity={ambientIntensity}
    />
    <directionalLight
      color={directionalColor}
      intensity={directionalIntensity}
      position={directionalPosition}
      castShadow={true}
    />
  </>
}