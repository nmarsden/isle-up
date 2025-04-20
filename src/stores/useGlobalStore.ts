import { create } from 'zustand'

export type GlobalState = {
    waterLevel: number;
    waveSpeed: number;
    waveAmplitude: number;
    foamDepth: number;
    hoveredIds: number[];

    setWaterLevel: (waterLevel: number) => void;
    setWaveSpeed: (waveSpeed: number) => void;
    setWaveAmplitude: (waveAmplitude: number) => void;
    setFoamDepth: (foamDepth: number) => void;
    setHovered: (id: number, hovered: boolean) => void;
};

const hoveredStates = new Array(25).fill(false);

const setHoveredState = (row: number, column: number, hovered: boolean) => {
    const index = Math.floor((row * 5) + column);
    hoveredStates[index] = hovered;
};

export const useGlobalStore = create<GlobalState>((set) => {
    return {
        waterLevel: 0.7,
        waveSpeed: 0.8,
        waveAmplitude: 0.05,
        foamDepth: 0.02,
        hoveredIds: [],

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
        
            const hoveredIds = hoveredStates.map((h, index) => h ? index: -1).filter(i => i >=0)
            return { hoveredIds }
        })
    }
})
