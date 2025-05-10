import { Howl, Howler } from "howler";
import { useEffect } from "react";
import { GlobalState, useGlobalStore } from "../stores/useGlobalStore";

const BLOOP = new Howl({ 
  src: ['audio/bloop-2-186531.mp3', 'audio/bloop-2-186531.webm'],
  format: ['mp3', 'webm'],
});
const LEVEL_COMPLETED = new Howl({ 
  src: ['audio/level-up-5-326133.mp3', 'audio/level-up-5-326133.webm'],
  format: ['mp3', 'webm'],
});
const MUSIC = new Howl({ 
  src: ['audio/hexahop-1.mp3', 'audio/hexahop-1.webm'], 
  format: ['mp3', 'webm'],
  autoplay: true,
  loop: true  
});

export default function Sound() {
  const playing = useGlobalStore((state: GlobalState) => state.playing);
  const upIds = useGlobalStore((state: GlobalState) => state.upIds);
  const levelCompleted = useGlobalStore((state: GlobalState) => state.levelCompleted);
  const soundEffects = useGlobalStore((state: GlobalState) => state.soundEffects);
  const music = useGlobalStore((state: GlobalState) => state.music);

  useEffect(() => { 
    Howler.volume(1); 
    MUSIC.play(); 
  }, []);

  useEffect(() => { 
    MUSIC.volume(music); 
  }, [ music ]);

  useEffect(() => { 
    BLOOP.volume(soundEffects); 
    LEVEL_COMPLETED.volume(soundEffects);
  }, [ soundEffects ]);

  useEffect(() => {
    if (!playing) return;

    BLOOP.play();

    if (levelCompleted) {
      LEVEL_COMPLETED.play();
    }
  }, [ playing, upIds, levelCompleted ])

  return <></>
}