import { GlobalState, useGlobalStore } from '../../stores/useGlobalStore';
import Info from './info/info';
import Levels from './levels/levels';
import './ui.css';
import {useCallback, useState} from "react";

export default function Ui() {
  const level = useGlobalStore((state: GlobalState) => state.level);
  const moves = useGlobalStore((state: GlobalState) => state.moves);
  const resetLevel = useGlobalStore((state: GlobalState) => state.resetLevel);

  const [showLevels, setShowLevels] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const onLevelsButtonClicked = useCallback(() => setShowLevels(true), []);
  const onLevelSelected = useCallback((level: number) => {
    setShowLevels(false);
    resetLevel(level);
  }, []);

  const onInfoButtonClicked = useCallback(() => setShowInfo(true), []);
  const onInfoClose = useCallback(() => setShowInfo(false), []);

  return (
      <>
          {(showInfo || showLevels) ? '' : (
            <>
              <div className="header">
                <div className="heading">Isle Up</div>
                <div className="actions">
                  <div className="level" onClick={onLevelsButtonClicked}>LEVEL&nbsp;{level + 1}</div>
                  <div className="about" onClick={onInfoButtonClicked}>ABOUT</div>
                </div>
              </div>
              <div className="footer">
                <div className="moves">MOVES: {moves}</div>
              </div>
            </>
          )}
          <Info show={showInfo} onClose={onInfoClose} />
          <Levels show={showLevels} onLevelSelected={onLevelSelected} />
      </>
  )
}