import { create } from 'zustand'

export type GlobalState = {
    waterLevel: number;
    waveSpeed: number;
    waveAmplitude: number;
    foamDepth: number;

    setWaterLevel: (waterLevel: number) => void;
    setWaveSpeed: (waveSpeed: number) => void;
    setWaveAmplitude: (waveAmplitude: number) => void;
    setFoamDepth: (foamDepth: number) => void;
};

export const useGlobalStore = create<GlobalState>((set) => {
    return {
        waterLevel: 0.7,
        waveSpeed: 0.8,
        waveAmplitude: 0.05,
        foamDepth: 0.02,

        setWaterLevel: (waterLevel: number) => set(() => ({ waterLevel })),
        setWaveSpeed: (waveSpeed: number) => set(() => ({ waveSpeed })),
        setWaveAmplitude: (waveAmplitude: number) => set(() => ({ waveAmplitude })),
        setFoamDepth: (foamDepth: number) => set(() => ({ foamDepth }))
    }
})
