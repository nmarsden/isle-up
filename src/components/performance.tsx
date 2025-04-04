import {useControls} from "leva";
import {Perf} from "r3f-perf";

export default function Performance (){
  const { showPerf } = useControls(
    'Performance',
    {
      showPerf: { value: true, label: 'show' }
    },
    {
      collapsed: true
    }
  );

  return (
    <>
      {showPerf ? <Perf position={'bottom-left'} /> : null}
    </>
  )
}