import {useMemo} from "react";
import {CanvasTexture, Mesh, MeshStandardMaterial, PlaneGeometry} from "three";
import {useFrame} from "@react-three/fiber";
import {folder, useControls} from "leva";

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

// Mound image
const displacementMoundImage = new Image()
displacementMoundImage.src = './textures/Circular.png'

// Texture
const displacementTexture = new CanvasTexture(displacementCanvas);

// Mounds
const mounds: { x: number; y: number; off: boolean }[] = [];
for (let x=0; x<5; x++) {
  for (let y=0; y<5; y++) {
    mounds.push({ x, y, off: (x === 2 && y === 2) });
  }
}

export default function Island() {
  const {
    planeColor, planeMetalness, planeRoughness, planeDisplacementScale, planeSize, planeSegments, planeWireframe, planeFlatShading, planeShadows, planeMoundOffRatio, planeMoundOffAlpha, planeMoundClearAlpha
  } = useControls(
    'Island',
    {
      'Plane': folder(
        {
          planeColor: {value: '#f8ed3b', label: 'color'},
          planeMetalness: { value: 0.0, label: 'metalness', min: 0, max: 1, step: 0.01 },
          planeRoughness: { value: 0.7, label: 'roughness', min: 0, max: 1, step: 0.01 },
          planeDisplacementScale: { value: 0.75, label: 'displacementScale', min: 0, max: 2, step: 0.01 },
          planeSize: { value: 5, label: 'size', min: 1, max: 100, step: 1 },
          planeSegments: { value: 100, label: 'segments', min: 10, max: 1000, step: 1 },
          planeWireframe: { value: false, label: 'wireframe' },
          planeFlatShading: { value: true, label: 'flatShading' },
          planeShadows: { value: true, label: 'shadows' },
          planeMoundOffRatio: { value: 0.75, label: 'moundOffRatio', min: 0.01, max: 4.0, step: 0.01 },
          planeMoundOffAlpha: { value: 0.5, label: 'moundOffAlpha', min: 0, max: 1, step: 0.001 },
          planeMoundClearAlpha: { value: 1.00, label: 'moundClearAlpha', min: 0, max: 1, step: 0.001 }
        }
      )
    },
    {
      collapsed: true
    }
  );

  const { plane } = useMemo(() => {

    // Plane Geometry
    const planeGeometry = new PlaneGeometry(planeSize, planeSize, planeSegments, planeSegments);

    // Plane Material
    const planeMaterial = new MeshStandardMaterial({
      color: planeColor,
      wireframe: planeWireframe,
      roughness: planeRoughness,
      metalness: planeMetalness,
      displacementMap: displacementTexture,
      displacementScale: planeDisplacementScale,
      flatShading: planeFlatShading
    });

    // Plane Mesh
    const plane = new Mesh(
      planeGeometry,
      planeMaterial
    );
    plane.rotation.x = Math.PI * -0.5;
    plane.castShadow = planeShadows;
    plane.receiveShadow = planeShadows;

    return { plane };
  }, [planeColor, planeMetalness, planeRoughness, planeDisplacementScale, planeSize, planeSegments, planeWireframe, planeFlatShading, planeShadows]);

  useFrame(() => {
    /**
     * Displacement
     */
    displacementContext.globalCompositeOperation = 'source-over';
    displacementContext.globalAlpha = planeMoundClearAlpha;
    displacementContext.fillRect(0, 0, displacementCanvas.width, displacementCanvas.height)

    // Draw mounds
    const numCells = 5;
    const cellSize = displacementCanvas.width / numCells;
    const moundOnSize = cellSize;
    const moundOnOffset = (cellSize - moundOnSize) * 0.5;

    const moundOffSize = cellSize * planeMoundOffRatio;
    const moundOffOffset = (cellSize - moundOffSize) * 0.5;
    displacementContext.globalCompositeOperation = 'lighten';
    mounds.forEach(mound => {
      const offset = mound.off ? moundOffOffset : moundOnOffset;
      const x = ((mound.x) * cellSize) + offset;
      const y = ((mound.y) * cellSize) + offset;
      const size = mound.off ? moundOffSize : moundOnSize
      displacementContext.globalAlpha = mound.off ? planeMoundOffAlpha : 1;
      displacementContext.drawImage(
        displacementMoundImage,
        x,
        y,
        size,
        size
      )
    });

    // Texture
    displacementTexture.needsUpdate = true
  });

  return <primitive object={plane} />
}
