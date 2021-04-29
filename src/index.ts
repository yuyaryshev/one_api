import deepMerge from "deepmerge";
import { readFileSync } from "fs";
import { resolve } from "path";
import { debugMsgFactory, ManageableTimer, yconsole } from "ystd";
import express from "express";
import { publishApis } from "./server/controllers/index.js";
import http from "http";
// @ts-ignore
import cors from "cors";

// @ts-ignore
//import nodeSSPI from "express-node-sspi";

const debug = debugMsgFactory("startup");

export interface EnvSettings {
    default?: boolean;
    port: number;
}

export const defaultSettings = (): EnvSettings => ({
    default: true,
    port: 4300,
});

export interface Env {
    terminating: boolean;
    onTerminateCallbacks: (() => void)[];
    versionStr: string;
    args: any;
    settings: EnvSettings;
    timers: Set<ManageableTimer>;
    terminate: () => void | Promise<void>;
}

export interface IssueLoaderVersion {
    major?: number;
    minor?: number;
    build?: number;
}

export const startApiServer = async (args?: any): Promise<Env> => {
    const pthis = ({
        args,
        onTerminateCallbacks: [],
        terminating: false,
        timers: new Set(),
        terminate: () => {
            for (const callback of pthis.onTerminateCallbacks) callback();
            pthis.terminating = true;
            for (const timer of pthis.timers) timer.cancel();
        },
    } as any) as Env;

    yconsole.log(`CODE00000094`, `Starting yone_api...`);
    const settingsPath = resolve("./settings.json");
    yconsole.log(`CODE00000197`, `settingsPath = ${settingsPath}`);

    const settingsFromFile = JSON.parse(readFileSync(settingsPath, "utf-8"));
    settingsFromFile.default = false;
    const settings = deepMerge(defaultSettings(), settingsFromFile);

    const env = Object.assign(pthis, {
        args,
        settings,
        //        dbProvider,
    } as Env);

    if (!env.settings.port) throw new Error(`CODE00000183 No port specified!`);

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
    } else {
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

    const httpServer = http.createServer(app);

    const httpServerInstance = httpServer.listen(env.settings.port, () => {
        yconsole.log(`CODE00000282`, `Started http://localhost:${env.settings.port}/api/one`);
    });

    env.onTerminateCallbacks.push(() => {
        httpServerInstance.close();
    });
    //    yconsole.log(`CODE00000279`, `yone_api - finished`);
    return env;
};
