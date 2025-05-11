import { useCallback, useEffect, useMemo, useRef } from 'react';
import { formattedLevel, GlobalState, useGlobalStore } from '../../../stores/useGlobalStore';
import './levels.css';
import { LEVELS_DATA } from '../../../levelsData';
import Star from '../star/star';

type GroupedLevels = {
  id: number;
  levels: number[][];
}

export default function Levels({ show, onLevelSelected, onClose }: { show: boolean; onLevelSelected: (level: number) => void; onClose: () => void; }) {
  const level = useGlobalStore((state: GlobalState) => state.level);
  const bestMoves = useGlobalStore((state: GlobalState) => state.bestMoves);
  const detailsRefs = useRef<(HTMLDetailsElement | null)[]>(new Array(10).fill(null));

  const groupedLevels: GroupedLevels[] = useMemo(() => {
    const groupedLevels: GroupedLevels[] = [];
    const numGroups = Math.floor(LEVELS_DATA.length / 10);
    for (let i=0; i<numGroups; i++) {
      groupedLevels.push({ id: i, levels: [] })
      for (let j=0; j<10; j++) {
        groupedLevels[i].levels.push(LEVELS_DATA[(i * 10) + j].data);
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

    // open/close details according to level
    const selectedGroupId = Math.floor(level / 10);
    groupedLevels.forEach((groupedLevel) => {
      const groupId = groupedLevel.id;
      if (detailsRefs.current[groupId]) {
        detailsRefs.current[groupId].open = (selectedGroupId === groupId);
      }
    })
  }, [ level ]);
  
  const renderLevelsGroup = (grplevels: GroupedLevels) => {
    const groupRange = { min: grplevels.id * 10, max: (grplevels.id * 10) + 9 };
    const groupHeading = `${formattedLevel(groupRange.min)} - ${formattedLevel(groupRange.max)}`;
    const selectedGroup = level >= groupRange.min && level <= groupRange.max;

    let isGroupLevelStarEarned = true;
    if (bestMoves.length <= groupRange.max) {
      isGroupLevelStarEarned = false;
    } else {
      for (let i=groupRange.min; i<=groupRange.max; i++) {
        const movesForStar = LEVELS_DATA[i].movesForStar;
        if (bestMoves[i] > movesForStar) {
          isGroupLevelStarEarned = false;
        }
      }
    }
    return (
      <details 
        ref={(element) => { detailsRefs.current[grplevels.id] = element; }} 
        key={grplevels.id} 
        onClick={(event) => {
          event.preventDefault();
          onDetailsClicked(grplevels.id);
        }}
      >
        <summary className={`${selectedGroup ? 'selected' : ''}`}>
          {groupHeading} <Star earned={isGroupLevelStarEarned} />
        </summary>
        <div className="levelsGroup">
        {grplevels.levels.map((_, i) => {
          const index = (grplevels.id * 10) + i;
          const isUnlocked = index <= bestMoves.length;
          const movesForStar = LEVELS_DATA[index].movesForStar;
          const isLevelStarEarned = bestMoves[index] <= movesForStar;
          return (
            <div
              key={index}
              className={`levelsButton ${isUnlocked ? 'unlocked' : 'locked'} ${level === index ? 'pulse' : ''}`}
              onClick={() => {
                if (isUnlocked) {
                  onLevelSelected(index);
                } 
              }}
            >
              <>{formattedLevel(index)}</>
              <Star earned={isLevelStarEarned} locked={!isUnlocked} />
            </div>
          );
        })}
        </div>
      </details>
    );
  }

  return (
    <div className={`overlay ${show ? 'show' : 'hide'}`}>
        <div className="levelsHeader">
          <div className="button-light" onClick={onClose}>
            <i className="fa-solid fa-close"></i>
          </div>
        </div>
      <div className="overlayHeading">Select a Level</div>
      <div className="levelsContainer">
        {groupedLevels.map((grplevels) => renderLevelsGroup(grplevels))}
      </div>
    </div>
  );
}