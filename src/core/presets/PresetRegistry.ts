import type { IPreset } from '../../types/preset';


const presetModules = import.meta.glob('./data/*.csm.json', { eager: true });

export const BUILT_IN_PRESETS: IPreset[] = Object.values(presetModules).map(
    (module: any) => module.default || module
);