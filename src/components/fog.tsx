import {useControls} from "leva";

export default function Fog() {
  const { fogColor, fogNear, fogFar } = useControls(
    'Fog',
    {
      fogColor: {value: 'white', label: 'color'},
      fogNear: {value: 0, min: 0, max: 1000, step: 1, label: 'near'},
      fogFar: {value: 260, min: 0, max: 1000, step: 1, label: 'far'},
    },
    {
      collapsed: true
    }
  );
  return (
    <fog attach="fog" args={[fogColor, fogNear, fogFar]} />
  );
}
