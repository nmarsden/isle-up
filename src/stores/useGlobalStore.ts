import { create } from 'zustand'

export const CELL_WIDTH = 12.25;
export const Y_UP = -0.01;
export const Y_DOWN = -1.2;

const gridState = [
  [1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1],
  [1, 1, 0, 1, 1]
];

const toIndex = (row: number, column: number): number => {
  return Math.floor((row * 5) + column);
};

const toRowAndCol = (index: number): { row: number, col: number } => {
  return {
    row: Math.floor(index / 5),
    col: (index % 5)
  }  
};
  
const getInitialUpIds = (): number[] => {
  const upIds = [];  
  for (let row=0; row<5; row++) {
    for (let col=0; col<5; col++) {
        const up = gridState[row][col] === 1;
        if (up) {
            upIds.push(toIndex(row, col));
        }
    }
  }
  return upIds;
};

type IslandState = {
  position: [number, number, number];
  hovered: boolean;
  up: boolean;
};

const islandStates: IslandState[] = new Array(25).fill({}).map((_, index) => {
  const {row, col} = toRowAndCol(index);
  const up = gridState[row][col] === 1;

  const x = col * CELL_WIDTH - (2 * CELL_WIDTH);
  const y = up ? Y_UP : Y_DOWN;
  const z = row * CELL_WIDTH - (2 * CELL_WIDTH);

  return {
    position: [x, y, z],
    hovered: false,
    up
  }
});

export type GlobalState = {
  waterLevel: number;
  waveSpeed: number;
  waveAmplitude: number;
  foamDepth: number;
  hoveredIds: number[];
  upIds: number[];
  
  setWaterLevel: (waterLevel: number) => void;
  setWaveSpeed: (waveSpeed: number) => void;
  setWaveAmplitude: (waveAmplitude: number) => void;
  setFoamDepth: (foamDepth: number) => void;
  setHovered: (id: number, hovered: boolean) => void;
  toggleUp: (id: number) => void;
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

export const useGlobalStore = create<GlobalState>((set) => {
  return {
    waterLevel: 0.7,
    waveSpeed: 0.8,
    waveAmplitude: 0.05,
    foamDepth: 0.02,
    hoveredIds: [],
    animatingIds: [],
    upIds: getInitialUpIds(),

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
    toggleUp: (id: number) => set(() => {
        const row = Math.floor(id / 5);
        const column = (id % 5);
        toggleUp(row, column);
        if (row > 0) toggleUp(row - 1, column);
        if (row < 4) toggleUp(row + 1, column);
        if (column > 0) toggleUp(row, column - 1);
        if (column < 4) toggleUp(row, column + 1);
        return { upIds: getUpIds() };
    })
  }
})
