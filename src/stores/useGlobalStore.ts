import { create } from 'zustand'

export type GlobalState = {
    waterLevel: number;
};

export const useGlobalStore = create<GlobalState>(() => {
    return {
        waterLevel: 0.33
    }
})
