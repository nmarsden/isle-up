import { useMemo } from 'react';
import { GlobalState, LEVELS, useGlobalStore } from '../../../stores/useGlobalStore';
import './completed.css';

export default function Completed({ show, onRetrySelected, onNextLevelSelected }: { 
  show: boolean, 
  onRetrySelected: () => void,
  onNextLevelSelected: () => void 
}) {
  const level = useGlobalStore((state: GlobalState) => state.level);
  const isAllCompleted = useMemo(() => {
    return level === (LEVELS.length - 1);
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
          <div className="completedHeading">LEVEL {level + 1} COMPLETED!</div>
          <div className="completedButton" onClick={() => onRetrySelected()}>RETRY</div>
          <div className="completedButton" onClick={() => onNextLevelSelected()}>NEXT LEVEL</div>
        </>
      )}
    </div>
  )
}