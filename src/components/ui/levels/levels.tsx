import { useCallback, useEffect, useMemo, useRef } from 'react';
import { formattedLevel, GlobalState, LEVELS, useGlobalStore } from '../../../stores/useGlobalStore';
import './levels.css';

type GroupedLevels = {
  id: number;
  levels: number[][];
}

export default function Levels({ show, onLevelSelected }: { show: boolean, onLevelSelected: (level: number) => void }) {
  const level = useGlobalStore((state: GlobalState) => state.level);
  const bestMoves = useGlobalStore((state: GlobalState) => state.bestMoves);
  const detailsRefs = useRef<(HTMLDetailsElement | null)[]>(new Array(10).fill(null));

  const groupedLevels: GroupedLevels[] = useMemo(() => {
    const groupedLevels: GroupedLevels[] = [];
    for (let i=0; i<10; i++) {
      groupedLevels.push({ id: i, levels: [] })
      for (let j=0; j<10; j++) {
        groupedLevels[i].levels.push(LEVELS[(i * 10) + j]);
      }
    }
    return groupedLevels;
  }, []);

  const onDetailsClicked = useCallback((id: number) => {
    if (!detailsRefs.current) return;

    // ensure only the clicked details is open
    groupedLevels.forEach((_, index) => {
      if (detailsRefs.current[index]) {
        detailsRefs.current[index].open = (index === id);
      }
    })

  }, [ groupedLevels ]);

  useEffect(() => {
    if (!detailsRefs.current) return;

    // open initial details according to level
    const index = Math.floor(level / 10);
    if (detailsRefs.current[index]) {
      detailsRefs.current[index].open = true;
    }
  }, [ level ]);
  
  const renderLevelsGroup = (grplevels: GroupedLevels) => {
    const groupRange = { min: grplevels.id * 10, max: (grplevels.id * 10) + 9 };
    const groupHeading = `${formattedLevel(groupRange.min)} - ${formattedLevel(groupRange.max)}`;
    const selectedGroup = level >= groupRange.min && level <= groupRange.max;
    return (
      <details 
        className={`${selectedGroup ? 'selected' : ''}`}
        ref={(element) => { detailsRefs.current[grplevels.id] = element; }} 
        key={grplevels.id} 
        onClick={(event) => {
          event.preventDefault();
          onDetailsClicked(grplevels.id);
        }}
      >
        <summary>{groupHeading}</summary>
        <div className="levelsGroup">
        {grplevels.levels.map((_, i) => {
          const index = (grplevels.id * 10) + i;
          const isUnlocked = index <= bestMoves.length;
          return (
            <div
              key={index}
              className={`levelsButton ${isUnlocked ? 'unlocked' : 'locked'} ${level === index ? 'selected' : ''}`}
              onClick={() => {
                if (isUnlocked) {
                  onLevelSelected(index);
                } 
              }}
            >
              {formattedLevel(index)}
            </div>
          );
        })}
        </div>
      </details>
    );
  }

  return (
    <div className={`levelsOverlay ${show ? 'show' : 'hide'}`}>
      <div className="levelsHeading">Select a Level</div>
      <div className="levelsContainer">
        {groupedLevels.map((grplevels) => renderLevelsGroup(grplevels))}
      </div>
    </div>
  );
}