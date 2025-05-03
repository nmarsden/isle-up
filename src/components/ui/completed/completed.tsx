import { useMemo } from 'react';
import { formattedLevel, GlobalState, useGlobalStore } from '../../../stores/useGlobalStore';
import './completed.css';
import { LEVELS_DATA } from '../../../levelsData';
import Star from '../star/star';

export default function Completed({ show, onRetrySelected, onNextLevelSelected }: { 
  show: boolean, 
  onRetrySelected: () => void,
  onNextLevelSelected: () => void 
}) {
  const level = useGlobalStore((state: GlobalState) => state.level);
  const moves = useGlobalStore((state: GlobalState) => state.moves);

  const isAllCompleted = useMemo(() => {
    return level === (LEVELS_DATA.length - 1);
  }, [ level ])

  const isStarEarned = useMemo(() => {
    return moves <= LEVELS_DATA[level].movesForStar;
  }, [ level, moves ])

  return (
    <div className={`overlay ${show ? 'show' : 'hide'}`}>
      {isAllCompleted ? (
        <>
          <div className="overlayHeading">All Levels Completed!</div>
          {isStarEarned ? <div className="completedStarEarned"><Star /> Earned</div> : <></>}
          <div className="button-light" onClick={() => onNextLevelSelected()}>OK</div>
        </>
      ) : (
        <>
          <div className="overlayHeading">Level {formattedLevel(level)} Completed!</div>
          {isStarEarned ? <div className="completedStarEarned"><Star /> Earned</div> : <></>}
          <div className="completedButtons">
            <div className="button-light" onClick={() => onRetrySelected()}>RETRY</div>
            <div className="button-light" onClick={() => onNextLevelSelected()}>NEXT</div>
          </div>
        </>
      )}
    </div>
  )
}