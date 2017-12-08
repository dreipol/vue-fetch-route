import { presets } from './presets';


export function createConfig(cfg) {
    return { ...presets, ...cfg };
};
