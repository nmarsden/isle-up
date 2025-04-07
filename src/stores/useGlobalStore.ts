import { create } from 'zustand'

export type GlobalState = {
    waterLevel: number;
    setWaterLevel: (waterLevel: number) => void
};

export const useGlobalStore = create<GlobalState>((set) => {
    return {
        waterLevel: 0.9,

        setWaterLevel: (waterLevel: number) => set(() => ({ waterLevel }))
    }
})
