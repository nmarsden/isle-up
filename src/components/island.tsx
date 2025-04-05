import {useMemo} from "react";
import {CanvasTexture, Mesh, MeshStandardMaterial, PlaneGeometry} from "three";
import {useFrame} from "@react-three/fiber";

/**
 * Displacement
 */
// 2D canvas
const displacementCanvas = document.createElement('canvas');
displacementCanvas.width = 128
displacementCanvas.height = 128
displacementCanvas.style.position = 'fixed'
displacementCanvas.style.width = '256px'
displacementCanvas.style.height = '256px'
displacementCanvas.style.top = '0'
displacementCanvas.style.left = '0'
displacementCanvas.style.zIndex = '10'
document.body.append(displacementCanvas)

// Context
const displacementContext = displacementCanvas.getContext('2d') as CanvasRenderingContext2D;
displacementContext.fillRect(0, 0, displacementCanvas.width, displacementCanvas.height);

// Glow image
const displacementGlowImage = new Image()
displacementGlowImage.src = './textures/glow.png'

// Texture
const displacementTexture = new CanvasTexture(displacementCanvas);

export default function Island() {
  const { plane } = useMemo(() => {

    // Plane Geometry
    const width = 7;
    const depth = 7;

    const planeWidth = width;
    const planeDepth = depth;
    const segmentsX = 20;
    const segmentsZ = 20;

    const planeGeometry = new PlaneGeometry(planeWidth, planeDepth, segmentsX - 1, segmentsZ - 1);

    // Plane Material
    const planeMaterial = new MeshStandardMaterial({
      color: "white",
      wireframe: true,
      roughness: 0.47,
      metalness: 0.25,
      displacementMap: displacementTexture
    });

    // Plane Mesh
    const plane = new Mesh(
      planeGeometry,
      planeMaterial
    );
    plane.rotation.x = Math.PI * -0.5;
    // plane.scale.setScalar(10);

    return { plane };
  }, []);

  useFrame(() => {
    /**
     * Displacement
     */
    displacementContext.globalCompositeOperation = 'source-over'
    displacementContext.globalAlpha = 0.02
    displacementContext.fillRect(0, 0, displacementCanvas.width, displacementCanvas.height)

    // Draw glow
    const cellSize = displacementCanvas.width * 0.2;
    const glowSize = displacementCanvas.width * 0.4;
    const glowOffset = (cellSize - glowSize) * 0.5;
    displacementContext.globalCompositeOperation = 'lighten'
    displacementContext.globalAlpha = 1;
    displacementContext.drawImage(
      displacementGlowImage,
      (1 * cellSize) + glowOffset,
      (1 * cellSize) + glowOffset,
      glowSize,
      glowSize
    )
    displacementContext.drawImage(
      displacementGlowImage,
      (2 * cellSize) + glowOffset,
      (2 * cellSize) + glowOffset,
      glowSize,
      glowSize
    )
    displacementContext.drawImage(
      displacementGlowImage,
      (3 * cellSize) + glowOffset,
      (3 * cellSize) + glowOffset,
      glowSize,
      glowSize
    )
    displacementContext.drawImage(
      displacementGlowImage,
      (4 * cellSize) + glowOffset,
      (4 * cellSize) + glowOffset,
      glowSize,
      glowSize
    )

    // Texture
    displacementTexture.needsUpdate = true
  });

  return <primitive object={plane} />
}
