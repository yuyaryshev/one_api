import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import pkg from "./package.json";

export default [
    {
        input: "src/start.ts",
        //extensions : [".js", ".jsx", ".ts", ".tsx"],
        output: {
            file: pkg.main,
            format: "cjs",
            sourcemap: true,
        },
        plugins: [typescript({ module: "ESNext" }), commonjs(), nodeResolve()],
        external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
    },
];
