import { useGLTF } from "@react-three/drei";
import { Mesh } from "three";

export default function Tree () {
    const {scene} = useGLTF("models/palm-bend.glb");
    
    return (
        <mesh 
            position={[0, 1, 0]}
            rotation-y={Math.PI * Math.random()}
            geometry={(scene.children[0] as Mesh).geometry}
            material={(scene.children[0] as Mesh).material}
            castShadow={true}
        />
    )
}

useGLTF.preload("models/palm-bend.glb")
