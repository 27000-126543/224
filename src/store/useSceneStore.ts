import { create } from 'zustand';

interface SceneState {
  selectedDevice: string | null;
  cameraView: 'overview' | 'truck' | 'pit' | 'incinerator' | 'turbine' | 'fluegas' | 'ashbin';
  showLabels: boolean;
  setSelectedDevice: (id: string | null) => void;
  setCameraView: (view: SceneState['cameraView']) => void;
  toggleLabels: () => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  selectedDevice: null,
  cameraView: 'overview',
  showLabels: true,
  setSelectedDevice: (id) => set({ selectedDevice: id }),
  setCameraView: (view) => set({ cameraView: view }),
  toggleLabels: () => set((state) => ({ showLabels: !state.showLabels }))
}));
