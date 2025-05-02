import { Howl, Howler } from "howler";
import { useEffect } from "react";
import { GlobalState, useGlobalStore } from "../stores/useGlobalStore";

const SOUND_WAVES = [
  new Howl({ src: ['audio/wave.webm', 'audio/wave.mp3'], format: ['webm', 'mp3']}),
  new Howl({ src: ['audio/wave2.webm', 'audio/wave2.mp3'], format: ['webm', 'mp3']})
];

export default function Sound() {
  const playing = useGlobalStore((state: GlobalState) => state.playing);
  const moves = useGlobalStore((state: GlobalState) => state.moves);
  const volume = useGlobalStore((state: GlobalState) => state.volume);

  useEffect(() => {
    Howler.volume(volume);
  }, [ volume ]);

  useEffect(() => {
    if (!playing) return;

    const soundIndex = Math.floor(Math.random() * 2);
    const rate = 0.3 + Math.random() * 0.3;
    const volume = 0.3 + (soundIndex * 0.2) + Math.random() * 0.2;
    const duration = (300 + Math.random() * 200);
    const soundWave = SOUND_WAVES[soundIndex];

    const id = soundWave.play();
    soundWave.rate(rate, id);
    soundWave.fade(volume, 0, duration, id);

  }, [ playing, moves ])

  return <></>
}