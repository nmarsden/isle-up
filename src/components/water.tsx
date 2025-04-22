import {useEffect, useMemo, useRef} from "react";
import {Color, MeshStandardMaterial, PlaneGeometry} from "three";
import {folder, useControls} from "leva";
import {useGlobalStore, GlobalState} from "../stores/useGlobalStore.ts";
import {useFrame} from "@react-three/fiber";

const islandRippleAnimationDurationMSecs = 1000;

const glsl = (x: any) => x;

const uniforms = {
  uTime: {value: 1},
  uWaveSpeed: {value: 0},
  uWaveAmplitude: {value: 0},
  uColorNear: {value: new Color()},
  uColorFar: {value: new Color()},
  uTextureSize: {value: 45},
  uRippleIslands: {value: new Array(25).fill(0)}
};

export default function Water() {
  const waterLevel = useGlobalStore((state: GlobalState) => state.waterLevel);
  const waveSpeed = useGlobalStore((state: GlobalState) => state.waveSpeed);
  const waveAmplitude = useGlobalStore((state: GlobalState) => state.waveAmplitude);
  const foamDepth = useGlobalStore((state: GlobalState) => state.foamDepth);
  const toggledIds = useGlobalStore((state: GlobalState) => state.toggledIds);
  const setWaterLevel = useGlobalStore((state: GlobalState) => state.setWaterLevel);
  const setWaveSpeed = useGlobalStore((state: GlobalState) => state.setWaveSpeed);
  const setWaveAmplitude = useGlobalStore((state: GlobalState) => state.setWaveAmplitude);
  const setFoamDepth = useGlobalStore((state: GlobalState) => state.setFoamDepth);

  const islandRippleAnimationStartTime = useRef(new Date().getTime());
  const animatingRipples = useRef(false);

  const {
    planeColor, planeAlpha, planeMetalness, planeRoughness, planeSegments, planeWireframe, planeFlatShading
  } = useControls(
    'Water',
    {
      'Settings': folder(
        {
          waterLevel: { value: waterLevel, label: 'waterLevel', min: 0.01, max: 0.11, step: 0.01, onChange: (value) => setWaterLevel(value) },
          waveSpeed: { value: waveSpeed, min: 0, max: 2.0, step: 0.01, label: "Wave Speed", onChange: (value) => setWaveSpeed(value) },
          waveAmplitude: { value: waveAmplitude, min: 0, max: 0.5, step: 0.01, label: "Wave Amplitude", onChange: (value) => setWaveAmplitude(value) },
          foamDepth: { value: foamDepth, min: 0, max: 1, step: 0.001, label: "Foam Depth", onChange: (value) => setFoamDepth(value) },
          colorNear: { value: '#00fccd', label: 'colorNear', onChange: (value) => { uniforms.uColorNear.value = new Color(value); } },
          colorFar: { value: '#1ceeff', label: 'colorFar', onChange: (value) => { uniforms.uColorFar.value = new Color(value); } },
          textureSize: { value: 45, label: 'textureSize', min: 0, max: 100, step: 1 , onChange: (value) => { uniforms.uTextureSize.value = value; } }
        }
      ),
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

  useEffect(() => { uniforms.uWaveSpeed.value = waveSpeed }, [ waveSpeed ]);
  useEffect(() => { uniforms.uWaveAmplitude.value = waveAmplitude }, [ waveAmplitude ]);
  useEffect(() => {

    for (let i=0; i<25; i++) {
      uniforms.uRippleIslands.value[i] = toggledIds.includes(i) ? 1.0 : 0.0;
    }
    islandRippleAnimationStartTime.current = new Date().getTime();
    animatingRipples.current = true;

  }, [ toggledIds ]);
  
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

    planeMaterial.onBeforeCompile = (shader) => {

      shader.uniforms.uTime = uniforms.uTime;
      shader.uniforms.uWaveSpeed = uniforms.uWaveSpeed;
      shader.uniforms.uWaveAmplitude = uniforms.uWaveAmplitude;
      shader.uniforms.uColorNear = uniforms.uColorNear;
      shader.uniforms.uColorFar = uniforms.uColorFar;
      shader.uniforms.uTextureSize = uniforms.uTextureSize;
      shader.uniforms.uRippleIslands = uniforms.uRippleIslands;

      const vertextShaderHeader = glsl`
        uniform float uTime;
        uniform float uWaveSpeed;
        uniform float uWaveAmplitude;
        
        varying vec2 vUv;
      `;

      shader.vertexShader = `
        ${vertextShaderHeader}

        ${shader.vertexShader}
      `.replace(
        glsl`#include <begin_vertex>`,
        glsl`
          #include <begin_vertex>
          
          // Send the uv coordinates to fragmentShader
          vUv = uv;
        
          // Modify the y position based on sine function, oscillating up and down over time
          float sineOffset = sin(uTime * uWaveSpeed) * uWaveAmplitude;
        
          // Apply the sine offset to the y component of the position
          vec3 modifiedPosition = position;
          modifiedPosition.z += sineOffset; // z used as y because element is rotated
         
          transformed = modifiedPosition;          
        `
      );

      const fragmentShaderHeader = glsl`
        uniform float uTime;
        uniform vec3 uColorNear;
        uniform vec3 uColorFar;
        uniform float uTextureSize;
        uniform float uRippleIslands[25];
    
        varying vec2 vUv;
      `;

      shader.fragmentShader = `
        ${fragmentShaderHeader}

        ${shader.fragmentShader}
      `;
      shader.fragmentShader = shader.fragmentShader.replace(
        glsl`#include <common>`,
        glsl`
          #include <common>

          vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
          vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
          vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
          
          float snoise(vec2 v) {
          
            const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                                0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                                -0.577350269189626,  // -1.0 + 2.0 * C.x
                                0.024390243902439); // 1.0 / 41.0
            vec2 i  = floor(v + dot(v, C.yy) );
            vec2 x0 = v -   i + dot(i, C.xx);
            vec2 i1;
            i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod289(i); // Avoid truncation effects in permutation
            vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                + i.x + vec3(0.0, i1.x, 1.0 ));
        
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
            m = m*m ;
            m = m*m ;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
            vec3 g;
            g.x  = a0.x  * x0.x  + h.x  * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
          }
        `);

      shader.fragmentShader = shader.fragmentShader.replace(
        glsl`#include <color_fragment>`,
        glsl`
          #include <color_fragment>

          // Set the current color as the base color.
          vec3 finalColor = diffuseColor.rgb;

          // Set an initial alpha value
          vec3 alpha = vec3(1.0);

          // Invert texture size
          float textureSize = 100.0 - uTextureSize;

          // Generate noise for the base texture
          float noiseBase = snoise(vUv * (textureSize * 2.8) + sin(uTime * 0.01));
          noiseBase = noiseBase * 0.5 + 0.5;
          vec3 colorBase = vec3(noiseBase);

          // Calculate foam effect using smoothstep and thresholding
          vec3 foam = smoothstep(0.08, 0.001, colorBase);
          foam = step(0.5, foam);  // binary step to create foam effect

          // Generate additional noise for waves
          float noiseWaves = snoise(vUv * textureSize + sin(uTime * -0.01));
          noiseWaves = noiseWaves * 0.5 + 0.5;
          vec3 colorWaves = vec3(noiseWaves);

          // Apply smoothstep for wave thresholding
          // Threshold for waves oscillates between 0.6 and 0.61
          float threshold = 0.6 + 0.01 * sin(uTime * 2.0);
          vec3 waveEffect = 1.0 - (smoothstep(threshold + 0.03, threshold + 0.032, colorWaves) +
                                   smoothstep(threshold, threshold - 0.01, colorWaves));

          // Binary step to increase the wave pattern thickness
          waveEffect = step(0.5, waveEffect);

          // Combine wave and foam effects
          vec3 combinedEffect = min(waveEffect + foam, 1.0);

          // Applying a gradient based on distance
          float vignette = length(vUv - 0.5) * 1.5;
          vec3 baseEffect = smoothstep(0.1, 0.3, vec3(vignette));
          vec3 baseColor = mix(finalColor, uColorFar, baseEffect);

          combinedEffect = min(waveEffect + foam, 1.0);
          combinedEffect = mix(combinedEffect, vec3(0.0), baseEffect);

          // Sample foam to maintain constant alpha of 1.0
          vec3 foamEffect = mix(foam, vec3(0.0), baseEffect);

          // Set the final color
          finalColor = (1.0 - combinedEffect) * baseColor + combinedEffect;

          // Managing the alpha based on the distance
          alpha = mix(vec3(0.2), vec3(1.0), foamEffect);
          alpha = mix(alpha, vec3(1.0), vignette + 0.5);

          // Ripples Experiment
          for(int i=0; i<25; i++){
            float rippleStrength = uRippleIslands[i];

            if (rippleStrength > 0.0) {
              float islandIndex = float(i);
              // float islandIndex = 22.0;

              float islandRow = floor(islandIndex / 5.0);
              float islandCol = mod(islandIndex, 5.0);
  
              float rippleX = islandCol - 2.0;
              float rippleY = islandRow - 2.0;
  
              vec2 ripplePosition = vec2(rippleX, -rippleY) * 0.0475;
              float rippleRadius = 1.0;
              vec3 rippleColor = vec3(1.0, 1.0, 1.0);
              vec2 offsetUv = vec2(vUv.x - ripplePosition.x, vUv.y - ripplePosition.y);
              float rippleAlpha = step(length(offsetUv - 0.5) * (12.0 - rippleRadius), 0.5);
  
              rippleAlpha *= (1.0 + sin((2.0 * uTime) - (500.0 * length(offsetUv - 0.5)))) * 0.5 * rippleStrength;
  
              finalColor = mix(finalColor, rippleColor, rippleAlpha);
            }

          }

          // Output the final color
          diffuseColor = vec4(finalColor, alpha);
          `
      );
    }

    return { planeGeometry, planeMaterial };
  },
  [
    planeColor, planeAlpha, planeMetalness, planeRoughness, planeSegments, planeWireframe, planeFlatShading
  ]);

  useFrame(({ clock }) => {
      uniforms.uTime.value = clock.getElapsedTime();

    // Animate island ripples
    const elapsedTime = new Date().getTime() - islandRippleAnimationStartTime.current;
    const animationProgress = elapsedTime / islandRippleAnimationDurationMSecs;
    if (animatingRipples.current) {
      if ((animationProgress > 1)) {
        animatingRipples.current = false;
        // Clear all ripples
        for (let i=0; i<25; i++) {
          uniforms.uRippleIslands.value[i] = 0.0;
        }
      } else {
        // Adjust ripple strengths
        const newRippleStrength = 1.0 - animationProgress;

        for (let i=0; i<25; i++) {
          let rippleStrength = uniforms.uRippleIslands.value[i];
          if (rippleStrength > 0) {
            rippleStrength = newRippleStrength;
          }
          uniforms.uRippleIslands.value[i] = rippleStrength;
        }
      }
    }

  })

  return <mesh
    position-y={waterLevel}
    rotation-x = {Math.PI * -0.5}
    receiveShadow={true}
    geometry={planeGeometry}
    material={planeMaterial}
  />
}
