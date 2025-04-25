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
    <div className={`completedOverlay ${show ? 'show' : 'hide'}`}>
      {isAllCompleted ? (
        <>
          <div className="completedHeading">ALL LEVELS COMPLETED!</div>
          <div className="completedButton" onClick={() => onNextLevelSelected()}>OK</div>
        </>
      ) : (
        <>
          <div className="completedHeading">LEVEL {formattedLevel(level)} COMPLETED!</div>
          <div className="completedButtons">
            <div className="completedButton" onClick={() => onRetrySelected()}>RETRY</div>
            <div className="completedButton" onClick={() => onNextLevelSelected()}>NEXT</div>
          </div>
        </>
      )}
    </div>
  )
}