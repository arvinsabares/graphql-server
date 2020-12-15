const tsConfig = require("./tsconfig.json");
const tsConfigPaths = require("tsconfig-paths");

const baseUrl = "./build/src";
const cleanup = tsConfigPaths.register({
    baseUrl,
    paths: tsConfig.compilerOptions.paths
});