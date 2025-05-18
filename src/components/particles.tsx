import { useEffect, useMemo, useRef } from "react";
import { AdditiveBlending, Points, ShaderMaterial, Uniform } from "three";
import { CELL_WIDTH, GlobalState, useGlobalStore } from "../stores/useGlobalStore";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import vertexShader from "../shaders/particles/vertex.glsl";
import fragmentShader from "../shaders/particles/fragment.glsl";
import { lerp } from "three/src/math/MathUtils.js";

export default function Particles() {
  const levelCompleted = useGlobalStore((state: GlobalState) => state.levelCompleted);
  const texture = useTexture("textures/Circular.png");
  const points = useRef<Points>(null);

  const count = 2000;

  const alphaAnimationDurationMSecs = useRef(5000);
  const alphaAnimationStartTime = useRef(new Date().getTime());
  const animating = useRef(false);

  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);

    const max = CELL_WIDTH * 5;
    for (let i = 0; i < count; i++) {
      let x = (Math.random() - 0.5) * max;
      let y = Math.random() * 90;
      let z = (Math.random() - 0.5) * max;

      positions.set([x, y, z], i * 3);
    }
    return positions;
  }, [count]);  

  const uniforms = useMemo(() => ({
    uTime: new Uniform(0.0),
    uAlpha: new Uniform(0.0),
    uTexture: new Uniform(texture)
  }), [])

  useEffect(() => {
    if (!points.current) return;

    if (levelCompleted) {
      points.current.visible = true;
    }
    alphaAnimationDurationMSecs.current = levelCompleted ? 5000 : 400;
    alphaAnimationStartTime.current = new Date().getTime();
    animating.current = true;

  }, [levelCompleted]);
  
  useFrame(({ clock }) => {
    if (!points.current || !points.current.visible) return;

    (points.current.material as ShaderMaterial).uniforms.uTime.value = clock.elapsedTime;

    if (animating.current) {
      const elapsedTime = new Date().getTime() - alphaAnimationStartTime.current;
      const animationProgress = elapsedTime / alphaAnimationDurationMSecs.current;
      if (animationProgress > 1) {
        animating.current = false;
        if (!levelCompleted) {
          points.current.visible = false;
        }
      } else {
        const alpha = levelCompleted ? lerp(0, 1, animationProgress) : lerp(1, 0, animationProgress);
        (points.current.material as ShaderMaterial).uniforms.uAlpha.value = alpha;
      }
    }

  });
    
  return (
    <points 
      ref={points}
      position={[0, 0, 0]} 
      visible={false}
    >
      <bufferGeometry>
        <bufferAttribute
          args={[particlesPosition, 3]}
          attach="attributes-position"
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
};

useTexture.preload("textures/Circular.png");