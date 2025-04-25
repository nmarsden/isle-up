import { Color } from 'three';
import { create } from 'zustand'
import { persist } from 'zustand/middleware';
import { LEVELS_DATA } from '../levelsData';

export const NUM_CELLS = 25;
export const CELL_WIDTH = 12.25;
export const Y_UP = -0.01;
export const Y_DOWN = -1.2;

export const formattedLevel = (level: number): string => {
  return (level + '').padStart(2, '0');
}

const toIndex = (row: number, column: number): number => {
  return Math.floor((row * 5) + column);
};

export const toRowAndCol = (index: number): { row: number, col: number } => {
  return {
    row: Math.floor(index / 5),
    col: (index % 5)
  }  
};
  
const getInitialUpIds = (): number[] => {
  return new Array(NUM_CELLS).fill(25).map((_, index) => index);
};

type IslandState = {
  hovered: boolean;
  up: boolean;
};

const islandStates: IslandState[] = new Array(25).fill({}).map(() => {
  return {
    hovered: false,
    up: true
  }
});

export type GlobalState = {
  underwaterColor: Color;
  waterLevel: number;
  waveSpeed: number;
  waveAmplitude: number;
  foamDepth: number;
  hoveredIds: number[];
  upIds: number[];
  toggledIds: number[];
  hoveredColor: Color;
  level: number;
  moves: number;
  levelCompleted: boolean;
  bestMoves: number[];

  setUnderwaterColor: (underwaterColor: Color) => void;
  setWaterLevel: (waterLevel: number) => void;
  setWaveSpeed: (waveSpeed: number) => void;
  setWaveAmplitude: (waveAmplitude: number) => void;
  setFoamDepth: (foamDepth: number) => void;
  setHovered: (id: number, hovered: boolean) => void;
  toggleUp: (id: number) => void;
  setHoveredColor: (hoveredColor: Color) => void;
  resetLevel: (level: number) => void;
};

const setHoveredState = (row: number, column: number, hovered: boolean) => {
  islandStates[toIndex(row, column)].hovered = hovered;
};

const getHoveredIds = (): number[] => {
    return islandStates.map((state, index) => state.hovered ? index: -1).filter(i => i >= 0);
}

const toggleUp = (row: number, column: number) => {
    const index = toIndex(row, column);
    const islandState = islandStates[index];
    islandState.up = !islandState.up;
};

const getUpIds = (): number[] => {
    return islandStates.map((state, index) => state.up ? index: -1).filter(i => i >= 0);
}

const logLevel = (level: number, upIds: number[], moves: number) => {
  const outputStrings: string[] = [];
  outputStrings.push(`  // -- ${formattedLevel(level)} -- (moves: ${moves})`);
  outputStrings.push(`  [`);
  for (let row=0; row<5; row++) {
    const rowStrings: string[] = [];
    for (let col=0; col<5; col++) {
      const index = toIndex(row, col);
      if (col === 0) {
        rowStrings.push(upIds.includes(index) ? '    1': '    0');
      } else {
        rowStrings.push(upIds.includes(index) ? ' 1': ' 0');
      }
    }
    let rowString = rowStrings.join(',');
    if (row < 4) {
      rowString += ',';
    }
    outputStrings.push(rowString);
  }
  outputStrings.push(`  ],`);

  const output = outputStrings.join('\n');
  console.log(output);
}

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set) => {
      return {
        underwaterColor: new Color('#0053ff'),
        waterLevel: 0.7,
        waveSpeed: 0.2,
        waveAmplitude: 0.09,
        foamDepth: 0.02,
        hoveredIds: [],
        animatingIds: [],
        upIds: getInitialUpIds(),
        toggledIds: [],
        hoveredColor: new Color('#ffffff'),
        level: 0,
        moves: 0,
        levelCompleted: false,
        bestMoves: [],

        setUnderwaterColor: (underwaterColor: Color) => set(() => ({ underwaterColor })),
        setWaterLevel: (waterLevel: number) => set(() => ({ waterLevel })),
        setWaveSpeed: (waveSpeed: number) => set(() => ({ waveSpeed })),
        setWaveAmplitude: (waveAmplitude: number) => set(() => ({ waveAmplitude })),
        setFoamDepth: (foamDepth: number) => set(() => ({ foamDepth })),
        setHovered: (id: number, hovered: boolean) => set(() => {
            const row = Math.floor(id / 5);
            const column = (id % 5);
            setHoveredState(row, column, hovered);
            if (row > 0) setHoveredState(row - 1, column, hovered);
            if (row < 4) setHoveredState(row + 1, column, hovered);
            if (column > 0) setHoveredState(row, column - 1, hovered);
            if (column < 4) setHoveredState(row, column + 1, hovered);
            return { hoveredIds: getHoveredIds() };
        }),
        toggleUp: (id: number) => set(({ level, moves, bestMoves }) => {
          const { row, col } = toRowAndCol(id);
          const toggledIds = [];

          toggleUp(row, col);
          toggledIds.push(toIndex(row, col));

          if (row > 0) {
            toggleUp(row - 1, col);
            toggledIds.push(toIndex(row - 1, col));
          }
          if (row < 4) {
            toggleUp(row + 1, col);
            toggledIds.push(toIndex(row + 1, col));
          }
          if (col > 0) {
            toggleUp(row, col - 1);
            toggledIds.push(toIndex(row, col - 1));
          }
          if (col < 4) {
            toggleUp(row, col + 1);
            toggledIds.push(toIndex(row, col + 1));
          }
          const upIds = getUpIds();
          const levelCompleted = upIds.length === NUM_CELLS;
          const updatedMoves = moves + 1;

          if (levelCompleted) {
            // Update best moves
            const isNoBestMoveYet = bestMoves.length === level;
            if (isNoBestMoveYet) {
              // new best move
              bestMoves.push(updatedMoves);
            } else {
              // update best move
              const bestMove = bestMoves[level];
              if (updatedMoves < bestMove) {
                bestMoves[level] = updatedMoves;
              }
            }
          }

          // Output level data (Note: uncomment when creating levels)
          // logLevel(level, upIds, updatedMoves);

          return { upIds, toggledIds, moves: updatedMoves, levelCompleted, bestMoves };
        }),
        setHoveredColor: (hoveredColor: Color) => set(() => ({ hoveredColor })),
        resetLevel: (level: number) => set(() => {
          // Perform toggles to change state to the desired level state
          const toggledIds: number[] = [];
          LEVELS_DATA[level].forEach((up, index) => {
            const { row, col } = toRowAndCol(index);
            const upCurrent = islandStates[index].up;
            const upTarget = up === 1;

            if (upCurrent !== upTarget) {
              toggleUp(row, col);
              toggledIds.push(toIndex(row, col));
            }
          })
          return { upIds: getUpIds(), toggledIds, level, moves: 0, levelCompleted: false };
        })
      }
    },
    {
      name: 'isle-up',
      partialize: (state) => ({ 
        level: state.level, 
        bestMoves: state.bestMoves 
      }),
    }
  )
);
