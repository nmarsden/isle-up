import { LEVELS_DATA } from '../../levelsData';
import { formattedLevel, GlobalState, useGlobalStore } from '../../stores/useGlobalStore';
import Completed from './completed/completed';
import Info from './info/info';
import Levels from './levels/levels';
import SplashScreen from './splashScreen/splashScreen';
import './ui.css';
import {useCallback, useEffect, useState} from "react";

export default function Ui() {
  const setPlaying = useGlobalStore((state: GlobalState) => state.setPlaying);
  const level = useGlobalStore((state: GlobalState) => state.level);
  const moves = useGlobalStore((state: GlobalState) => state.moves);
  const levelCompleted = useGlobalStore((state: GlobalState) => state.levelCompleted);
  const resetLevel = useGlobalStore((state: GlobalState) => state.resetLevel);

  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const [showLevels, setShowLevels] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

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

  const onInfoButtonClicked = useCallback(() => setShowInfo(true), []);
  const onInfoClose = useCallback(() => setShowInfo(false), []);
  const onResetButtonClicked = useCallback(() => resetLevel(level), [ level ]);

  const onRetrySelected = useCallback(() => {
    setShowCompleted(false);
    resetLevel(level);
  }, [ level ]);

  const onNextLevelSelected = useCallback(() => {
    setShowCompleted(false);
    const nextLevel = (level + 1) % LEVELS_DATA.length;
    resetLevel(nextLevel);
  }, [ level ]);

  useEffect(() => {
    if (levelCompleted) {
      setShowCompleted(true);
    }
  }, [ levelCompleted ]);
  
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
                  <div className="button-dark" onClick={onLevelsButtonClicked}>LEVEL&nbsp;{formattedLevel(level)}</div>
                  <div className="button-dark" onClick={onInfoButtonClicked}>ABOUT</div>
                </div>
              </div>
              <div className="footer">
                <div className="moves">MOVES: {moves}</div>
                <div className="button-dark" onClick={onResetButtonClicked}>RESET</div>
              </div>
            </>
          )}
          <SplashScreen show={showSplashScreen} onPlaySelected={onPlaySelected} />
          <Info show={showInfo} onClose={onInfoClose} />
          <Levels show={showLevels} onLevelSelected={onLevelSelected} />
          <Completed show={showCompleted} onRetrySelected={onRetrySelected} onNextLevelSelected={onNextLevelSelected} />
      </>
  )
}