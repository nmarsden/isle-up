import { LEVELS } from '../../../stores/useGlobalStore';
import './levels.css';

export default function Levels({ show, onLevelSelected }: { show: boolean, onLevelSelected: (level: number) => void }) {
    return (
      <div className={`levelsOverlay ${show ? 'show' : 'hide'}`}>
          <div className="levelsHeading">Select a Level</div>
          {LEVELS.map((_, index) => 
            <div 
                key={index}
                className="levelsButton" 
                onClick={() => onLevelSelected(index)}
            >
                Level {index + 1}
            </div>
        )}
      </div>
    )
}