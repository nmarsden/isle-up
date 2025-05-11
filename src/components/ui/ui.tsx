import { LEVELS_DATA } from '../../levelsData';
import { formattedLevel, GlobalState, useGlobalStore } from '../../stores/useGlobalStore';
import Info from './info/info';
import Levels from './levels/levels';
import SplashScreen from './splashScreen/splashScreen';
import Star from './star/star';
import './ui.css';
import {useCallback, useState} from "react";

export default function Ui() {
  const setPlaying = useGlobalStore((state: GlobalState) => state.setPlaying);
  const level = useGlobalStore((state: GlobalState) => state.level);
  const star = useGlobalStore((state: GlobalState) => state.star);
  const moves = useGlobalStore((state: GlobalState) => state.moves);
  const movesForStar = useGlobalStore((state: GlobalState) => state.movesForStar);
  const levelCompleted = useGlobalStore((state: GlobalState) => state.levelCompleted);
  const starEarned = useGlobalStore((state: GlobalState) => state.starEarned);
  const nextEnabled = useGlobalStore((state: GlobalState) => state.nextEnabled);
  const resetLevel = useGlobalStore((state: GlobalState) => state.resetLevel);
  const soundEffects = useGlobalStore((state: GlobalState) => state.soundEffects);
  const toggleSoundEffects = useGlobalStore((state: GlobalState) => state.toggleSoundEffects);
  const music = useGlobalStore((state: GlobalState) => state.music);
  const toggleMusic = useGlobalStore((state: GlobalState) => state.toggleMusic);
  const showHint = useGlobalStore((state: GlobalState) => state.showHint);

  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const [showLevels, setShowLevels] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const onPlaySelected = useCallback(() => {
    setShowSplashScreen(false);
    setPlaying();
    resetLevel(level);
  }, [ level ]);

  const onLevelsButtonClicked = useCallback(() => setShowLevels(true), []);
  const onLevelSelected = useCallback((level: number) => {
    setShowLevels(false);
    resetLevel(level);
  }, []);
  const onLevelsClose = useCallback(() => setShowLevels(false), []);

  const onInfoButtonClicked = useCallback(() => setShowInfo(true), []);
  const onInfoClose = useCallback(() => setShowInfo(false), []);

  const onSoundEffectsClicked = useCallback(() => toggleSoundEffects(), []);
  const onMusicClicked = useCallback(() => toggleMusic(), []);

  const onResetButtonClicked = useCallback(() => {
    resetLevel(level)
  }, [ level ]);

  const onNextButtonClicked = useCallback(() => {
    if (!nextEnabled) return;

    const nextLevel = (level + 1) % LEVELS_DATA.length;
    resetLevel(nextLevel);
  }, [ level, nextEnabled ]);

  return (
      <>
          {(showSplashScreen || showInfo || showLevels) ? '' : (
            <>
              <div className="header">
                <div className="logo">
                  <div className="logo-icon"></div>
                  <div className="logo-text">Isle Up</div>
                </div>
                <div className="actions">
                  <div className="button-dark" onClick={onSoundEffectsClicked}><span className={`fa-solid ${soundEffects === 0 ? 'fa-volume-xmark' : 'fa-volume-high'}`}></span></div>
                  <div className="button-dark" onClick={onMusicClicked}>
                    <span className="stacked-icons">
                      <i className="fa-solid fa-music"></i>
                      {music === 0 ? <i className="fa-solid fa-slash"></i> : <></>}
                    </span>                    
                  </div>
                  <div className="button-dark" onClick={onInfoButtonClicked}><span className="fa-solid fa-circle-info"></span></div>
                </div>
                {showHint ? (
                  <div className="toastMessage">
                    <div>Click the <i className="fa-regular fa-square fa-beat"></i> below</div>
                  </div>
                ) : <></>}
                {levelCompleted ? (
                  <div className="toastMessage">
                    <div>Level {formattedLevel(level)} Completed</div>
                    {starEarned ? <div><Star /> Earned!</div> : <></>}
                  </div>
                ) : <></>}
              </div>
              <div className="footer">
                <div className="movesContainer">
                  <div>MOVES: {moves}</div>
                  {movesForStar > 0 ? <div className="movesForStar">{movesForStar} moves = <Star /></div> : <></>}
                </div>
                <div className="footerActions">
                  <div className="button-dark button-wide" onClick={onLevelsButtonClicked}>
                    <span>{formattedLevel(level)}</span>
                    <span className="button-badge"><Star earned={star}/></span>
                  </div>
                  <div className={`button-dark button-wide ${levelCompleted ? 'button-pulse' : ''} ${nextEnabled ? '' : 'button-disabled'}`} onClick={onNextButtonClicked}>Next</div>
                  <div className="button-dark button-wide" onClick={onResetButtonClicked}><span className="fa-solid fa-arrows-rotate"></span></div>
                </div>
              </div>
            </>
          )}
          <SplashScreen show={showSplashScreen} onPlaySelected={onPlaySelected} />
          <Info show={showInfo} onClose={onInfoClose} />
          <Levels show={showLevels} onLevelSelected={onLevelSelected} onClose={onLevelsClose} />
      </>
  )
}