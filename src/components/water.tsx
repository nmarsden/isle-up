import {useMemo} from "react";
import {Mesh, MeshStandardMaterial, PlaneGeometry} from "three";
import {folder, useControls} from "leva";

export default function Water() {
  const {
    planePositionY, planeColor, planeAlpha, planeMetalness, planeRoughness, planeSize, planeSegments, planeWireframe, planeFlatShading, planeShadows
  } = useControls(
    'Water',
    {
      'Plane': folder(
        {
          planePositionY: { value: 0.33, label: 'positionY', min: 0, max: 1, step: 0.01 },
          planeColor: {value: '#3bf8dc', label: 'color'},
          planeAlpha: { value: 0.5, label: 'alpha', min: 0, max: 1, step: 0.01 },
          planeMetalness: { value: 0.0, label: 'metalness', min: 0, max: 1, step: 0.01 },
          planeRoughness: { value: 0.7, label: 'roughness', min: 0, max: 1, step: 0.01 },
          planeDisplacementScale: { value: 0.75, label: 'displacementScale', min: 0, max: 2, step: 0.01 },
          planeSize: { value: 5, label: 'size', min: 1, max: 100, step: 1 },
          planeSegments: { value: 1, label: 'segments', min: 1, max: 1000, step: 1 },
          planeWireframe: { value: false, label: 'wireframe' },
          planeFlatShading: { value: true, label: 'flatShading' },
          planeShadows: { value: true, label: 'shadows' }
        }
      )
    },
    {
      collapsed: true
    }
  );

  const { plane } = useMemo(() => {

    // Plane Geometry
    const planeGeometry = new PlaneGeometry(1, 1, planeSegments, planeSegments);

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

    // Plane Mesh
    const plane = new Mesh(
      planeGeometry,
      planeMaterial
    );
    plane.scale.setScalar(planeSize);
    plane.rotation.x = Math.PI * -0.5;
    plane.position.y = planePositionY;
    // plane.castShadow = planeShadows;
    plane.receiveShadow = planeShadows;

    return { plane };
  }, [planePositionY, planeColor, planeAlpha, planeMetalness, planeRoughness, planeSize, planeSegments, planeWireframe, planeFlatShading, planeShadows]);

  return <primitive object={plane} />
}
