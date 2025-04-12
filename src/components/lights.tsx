import {folder, useControls} from "leva";
import {useEffect, useRef} from "react";
import {DirectionalLight, PCFSoftShadowMap} from "three";
import useShadowHelper from "../hooks/useShadowHelper.tsx";
import {useThree} from "@react-three/fiber";

export default function Lights() {
  const { gl } = useThree();
  const directionalLight = useRef<DirectionalLight>(null!);

  const {
    ambientColor, ambientIntensity,
    directionalColor, directionalIntensity, directionalPosition,
    directionalShadowNormalBias, directionalShadowBias, directionalShadowCamNear, directionalShadowCamFar, directionalShadowCamFrustum, directionalShadowMapPOT, directionalShadowHelperEnabled
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
          directionalPosition: {value: [1, 0.5, -1], label: 'position'},
          directionalShadowNormalBias: {value: 0.05, min: 0, max: 1, step: 0.01, label: 'shadowNormalBias'},
          directionalShadowBias: {value: 0.0, min: 0, max: 1, step: 0.01, label: 'shadowBias'},
          directionalShadowCamNear: {value: 0.1, min: 0, max: 50, step: 0.01, label: 'shadowCamNear'},
          directionalShadowCamFar: {value: 3.0, min: 0, max: 50, step: 0.01, label: 'shadowCamFar'},
          directionalShadowCamFrustum: {value: 0.5, min: 0, max: 50, step: 0.01, label: 'shadowCamFrustum'},
          directionalShadowMapPOT: {value: 9, min: 0, max: 12, step: 1, label: 'shadowMapPOT'},
          directionalShadowHelperEnabled: {value: false, label: 'showHelper'}
        }
      )
    },
    {
      collapsed: true
    }
  );

  useShadowHelper(directionalLight, directionalShadowHelperEnabled);

  useEffect(() => {
    gl.shadowMap.type = PCFSoftShadowMap;
    // gl.shadowMap.type = BasicShadowMap;
    // gl.shadowMap.type = PCFShadowMap;
  }, [ gl ]);

  useEffect(() => {
    directionalLight.current.shadow.camera.near = directionalShadowCamNear;
    directionalLight.current.shadow.camera.far = directionalShadowCamFar;
    directionalLight.current.shadow.mapSize.width = Math.pow(2, directionalShadowMapPOT);
    directionalLight.current.shadow.mapSize.height = Math.pow(2, directionalShadowMapPOT);
    directionalLight.current.shadow.normalBias = directionalShadowNormalBias;
    directionalLight.current.shadow.bias = directionalShadowBias * 0.1;
    directionalLight.current.shadow.camera.top = directionalShadowCamFrustum;
    directionalLight.current.shadow.camera.right = directionalShadowCamFrustum;
    directionalLight.current.shadow.camera.bottom = -directionalShadowCamFrustum;
    directionalLight.current.shadow.camera.left = -directionalShadowCamFrustum;

  }, [directionalLight, directionalShadowNormalBias, directionalShadowBias, directionalShadowCamNear, directionalShadowCamFar, directionalShadowCamFrustum, directionalShadowMapPOT]);

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
