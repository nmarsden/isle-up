import {useMemo} from "react";
import {MeshStandardMaterial, PlaneGeometry} from "three";
import {folder, useControls} from "leva";
import {useGlobalStore, GlobalState} from "../stores/useGlobalStore.ts";

export default function Water() {
  const waterLevel = useGlobalStore((state: GlobalState) => state.waterLevel);

  const {
    planeColor, planeAlpha, planeMetalness, planeRoughness, planeSegments, planeWireframe, planeFlatShading
  } = useControls(
    'Water',
    {
      'Plane': folder(
        {
          planeColor: {value: '#3bf8dc', label: 'color'},
          planeAlpha: { value: 0.5, label: 'alpha', min: 0, max: 1, step: 0.01 },
          planeMetalness: { value: 0.0, label: 'metalness', min: 0, max: 1, step: 0.01 },
          planeRoughness: { value: 0.7, label: 'roughness', min: 0, max: 1, step: 0.01 },
          planeDisplacementScale: { value: 0.75, label: 'displacementScale', min: 0, max: 2, step: 0.01 },
          planeSegments: { value: 1, label: 'segments', min: 1, max: 1000, step: 1 },
          planeWireframe: { value: false, label: 'wireframe' },
          planeFlatShading: { value: true, label: 'flatShading' },
        }
      )
    },
    {
      collapsed: true
    }
  );

  const { planeGeometry, planeMaterial } = useMemo(() => {

    // Plane Geometry
    const planeGeometry = new PlaneGeometry(256, 256, planeSegments, planeSegments);

    // Plane Material
    const planeMaterial = new MeshStandardMaterial({
      color: planeColor,
      wireframe: planeWireframe,
      roughness: planeRoughness,
      metalness: planeMetalness,
      flatShading: planeFlatShading,
      transparent: true,
      opacity: planeAlpha
    });

    return { planeGeometry, planeMaterial };

  }, [planeColor, planeAlpha, planeMetalness, planeRoughness, planeSegments, planeWireframe, planeFlatShading]);

  return <mesh
    position-y={waterLevel}
    rotation-x = {Math.PI * -0.5}
    receiveShadow={true}
    geometry={planeGeometry}
    material={planeMaterial}
  />
}
