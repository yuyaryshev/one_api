import deepMerge from "deepmerge";
import { readFileSync } from "fs";
import { resolve } from "path";
import { debugMsgFactory, yconsole } from "ystd";
// import oracledb from "oracledb";
// import { OracleConnection0 } from "Yoracle";
import express from "express";
import { publishApis } from "./server/controllers/index";
import http from "http";
// @ts-ignore
import cors from "cors";
// @ts-ignore
//import nodeSSPI from "express-node-sspi";
const debug = debugMsgFactory("startup");
export const defaultSettings = () => ({
    port: 4300,
    instanceName: "unnamed",
    //    oracle: {} as any,
    noDbTest: false,
});
export const startApiServer = async (args) => {
    const pthis = {
        args,
        onTerminateCallbacks: [],
        terminating: false,
        timers: new Set(),
        terminate: () => {
            for (let callback of pthis.onTerminateCallbacks)
                callback();
            pthis.terminating = true;
            for (let timer of pthis.timers)
                timer.cancel();
        },
    };
    yconsole.log(`CODE00000094`, `Starting ysurvey...`);
    const settingsPath = resolve("./settings.json");
    yconsole.log(`CODE00000197`, `settingsPath = ${settingsPath}`);
    const settings = deepMerge(defaultSettings(), JSON.parse(readFileSync(settingsPath, "utf-8")));
    if (settings.port)
        yconsole.log(`CODE00000198`, `Api server on port ${settings.port}`);
    let v = {};
    try {
        v = JSON.parse(readFileSync("version.json", "utf-8"));
    }
    catch (e) {
        if (e.code !== "ENOENT")
            throw e;
    }
    const versionStr = `${v.major || 0}.${v.minor || 0}.${v.build || 0}`;
    yconsole.log(`CODE00000199`, `version = ${versionStr}`);
    yconsole.log(`CODE00000307`, `Load settings - finished`);
    const env = Object.assign(pthis, {
        versionStr,
        args,
        settings,
        //        dbProvider,
    });
    yconsole.log(`CODE00000284`, `startApiServer`);
    if (!env.settings.port)
        throw new Error(`CODE00000183 No port specified!`);
    //    const sspiInstance = nodeSSPI({ retrieveGroups: false });
    const app = express();
    app.use(cors());
    // app.use(function(req, res, next) {
    //      res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    //      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //      next();
    // });
    if (!process.argv.join(" ").includes("--devuser=")) {
        //        app.use(nodeSSPI({ retrieveGroups: false }));
    }
    else {
        console.log(`CODE00000291 devuser is set! No SSPI! ${process.argv.join(" ")}`);
    }
    app.use(express.json());
    // app.use(function(req, res, next) {
    //     try {
    //         sspiInstance(req, res, next);
    //     } catch (e) {
    //         console.error(`CODE00000281 sspiInstance error ${sspiInstance.message}`);
    //     }
    //     next();
    // });
    // app.use(function(req, res, next) {
    //     res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    //     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //     next();
    // });
    //    app.use(cors());
    app.use(express.static("public"));
    publishApis(env, app);
    let httpServer = http.createServer(app);
    const httpServerInstance = httpServer.listen(env.settings.port, () => {
        console.log(`CODE00000282`, `Started /runStatus and /api/runStatus monitor endpoint on port ${env.settings.port}...`);
        yconsole.log(`CODE00000283`, `Started /runStatus and /api/runStatus monitor endpoint on port ${env.settings.port}...`);
    });
    env.onTerminateCallbacks.push(() => {
        httpServerInstance.close();
    });
    yconsole.log(`CODE00000279`, `startEnv - finished`);
    return env;
};
//# sourceMappingURL=index.js.map