import { Howl, Howler } from "howler";
import { useEffect } from "react";
import { GlobalState, useGlobalStore } from "../stores/useGlobalStore";

const SOUND_WAVE = new Howl({ src: ['audio/wave.webm', 'audio/wave.mp3'], format: ['webm', 'mp3']});

export default function Sound() {
  const playing = useGlobalStore((state: GlobalState) => state.playing);
  const moves = useGlobalStore((state: GlobalState) => state.moves);
  const volume = useGlobalStore((state: GlobalState) => state.volume);

  useEffect(() => {
    Howler.volume(volume);
  }, [ volume ]);

  useEffect(() => {
    if (!playing) return;

    SOUND_WAVE.play();

  }, [ playing, moves ])

  return <></>
}