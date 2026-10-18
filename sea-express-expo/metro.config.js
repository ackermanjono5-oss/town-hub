const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// METRO_MAX_WORKERS caps Metro's transform workers for low-memory release
// builds — by default it starts one per CPU core, and on a machine short of
// RAM those workers die with "process out of memory" mid-bundle. Unset, Metro
// keeps its own default.
const maxWorkers = Number(process.env.METRO_MAX_WORKERS) || undefined;

module.exports = mergeConfig(defaultConfig, maxWorkers ? { maxWorkers } : {});
