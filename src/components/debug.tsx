import {Leva} from "leva";
import {useEffect, useState} from "react";

export default function Debug (){
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (window.location.hash === '#debug') {
      setHidden(false)
    }
    window.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'd') {
        setHidden(hidden => !hidden);
      }
    });
  }, []);

  return (
    <Leva hidden={hidden} />
  )
}