import { formattedLevel, GlobalState, LEVELS, useGlobalStore } from '../../../stores/useGlobalStore';
import './levels.css';

export default function Levels({ show, onLevelSelected }: { show: boolean, onLevelSelected: (level: number) => void }) {
  const bestMoves = useGlobalStore((state: GlobalState) => state.bestMoves);

  return (
    <div className={`levelsOverlay ${show ? 'show' : 'hide'}`}>
        <div className="levelsHeading">Select a Level</div>
        {LEVELS.map((_, index) => {
          const isUnlocked = index <= bestMoves.length;
          return (
            <div 
              key={index}
              className={`levelsButton ${isUnlocked ? 'unlocked' : 'locked'}`}
              onClick={() => {
                if (isUnlocked) {
                  onLevelSelected(index);
                } 
              }}
            >
              {formattedLevel(index)}
            </div>
          );
        }
      )}
    </div>
  )
}