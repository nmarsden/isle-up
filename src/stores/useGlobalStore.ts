import { create } from 'zustand'

export type GlobalState = {
    waterLevel: number;
    waveSpeed: number;
    waveAmplitude: number;

    setWaterLevel: (waterLevel: number) => void;
    setWaveSpeed: (waveSpeed: number) => void;
    setWaveAmplitude: (waveAmplitude: number) => void;
};

export const useGlobalStore = create<GlobalState>((set) => {
    return {
        waterLevel: 0.9,
        waveSpeed: 1.2,
        waveAmplitude: 0.1,

        setWaterLevel: (waterLevel: number) => set(() => ({ waterLevel })),
        setWaveSpeed: (waveSpeed: number) => set(() => ({ waveSpeed })),
        setWaveAmplitude: (waveAmplitude: number) => set(() => ({ waveAmplitude }))
    }
})
