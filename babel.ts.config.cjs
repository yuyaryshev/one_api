let fs = require("fs");
let tsconf = eval("(()=>(" + fs.readFileSync("tsconfig.json", "utf-8") + "))()");

let aliases = {};
for (let k in tsconf.compilerOptions.paths) {
    let v = tsconf.compilerOptions.paths[k];
    aliases[k] = "./" + v[0];
}

module.exports = {
    presets: ["@babel/preset-typescript"],
    plugins: [
        ["@babel/plugin-proposal-decorators", { legacy: true }],
        "@babel/proposal-optional-chaining",
        ["@babel/proposal-class-properties", { legacy: true }],
        "@babel/proposal-object-rest-spread",
        [
            "module-resolver",
            {
                root: ["./"],
                alias: aliases,
            },
        ],
        "@babel/transform-modules-commonjs",
    ],
};
