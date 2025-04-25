import { Howl, Howler } from "howler";
import { button, useControls } from "leva";
import { useEffect } from "react";
import { GlobalState, useGlobalStore } from "../stores/useGlobalStore";

const SOUND_WAVE = new Howl({ src: ['audio/wave.webm', 'audio/wave.mp3'], format: ['webm', 'mp3']});

export default function Sound() {
  const playing = useGlobalStore((state: GlobalState) => state.playing);
  const moves = useGlobalStore((state: GlobalState) => state.moves);

  useControls(
      'Sound',
      {
          volume: { value: 1, min: 0, max: 1, step: 0.1, onChange: value => Howler.volume(value) },
          wave: button(() => SOUND_WAVE.play())
      },
      {
          collapsed: true
      }
  );

  useEffect(() => {
    if (!playing) return;

    SOUND_WAVE.play();

  }, [ playing, moves ])

  return <></>
}