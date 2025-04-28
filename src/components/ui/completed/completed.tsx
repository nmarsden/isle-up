import { useMemo } from 'react';
import { formattedLevel, GlobalState, useGlobalStore } from '../../../stores/useGlobalStore';
import './completed.css';
import { LEVELS_DATA } from '../../../levelsData';

export default function Completed({ show, onRetrySelected, onNextLevelSelected }: { 
  show: boolean, 
  onRetrySelected: () => void,
  onNextLevelSelected: () => void 
}) {
  const level = useGlobalStore((state: GlobalState) => state.level);
  const isAllCompleted = useMemo(() => {
    return level === (LEVELS_DATA.length - 1);
  }, [ level ])

  return (
    <div className={`overlay ${show ? 'show' : 'hide'}`}>
      {isAllCompleted ? (
        <>
          <div className="overlayHeading">All Levels Completed!</div>
          <div className="button-light" onClick={() => onNextLevelSelected()}>OK</div>
        </>
      ) : (
        <>
          <div className="overlayHeading">Level {formattedLevel(level)} Completed!</div>
          <div className="completedButtons">
            <div className="button-light" onClick={() => onRetrySelected()}>RETRY</div>
            <div className="button-light" onClick={() => onNextLevelSelected()}>NEXT</div>
          </div>
        </>
      )}
    </div>
  )
}