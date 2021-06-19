import deepMerge from "deepmerge";
import { readFileSync } from "fs";
import { resolve } from "path";
import { debugMsgFactory, ManageableTimer, yconsole } from "ystd";
import express from "express";
import http from "http";
// @ts-ignore
import cors from "cors";
import { publishOneApis } from "./oneApi.js";
import { emptyEnv, mergeEnv } from "ystd_server";
import { EnvBase } from "ystd_server/dist";

// @ts-ignore
//import nodeSSPI from "express-node-sspi";

const debug = debugMsgFactory("startup");

export interface HandlerParams {
    data: any;
    currentDataVersion?: string;
    prevDataVersion?: string;
    newDataVersion?: string;
}

export interface OneApiSettings {
    port: number;
    onGet?: (params: HandlerParams) => Promise<void>;
    onPost?: (params: HandlerParams) => Promise<void>;
}

export const defaultSettings = (): OneApiSettings => ({
    port: 4300,
});

export interface OneApiEnv<SettingsT extends OneApiSettings = OneApiSettings> {
    settings: SettingsT;
}

export type OneApiServerEnv = OneApiEnv & EnvBase;

export interface IssueLoaderVersion {
    major?: number;
    minor?: number;
    build?: number;
}

export const startOneApiServer = async (opts?: OneApiSettings): Promise<OneApiServerEnv> => {
    const pthis = emptyEnv() as any as OneApiServerEnv;

    yconsole.log(`CODE00000094`, `Starting yone_api...`);
    const settingsPath = resolve("./settings.json");
    yconsole.log(`CODE00000197`, `settingsPath = ${settingsPath}`);

    let settingsFromFile: (OneApiSettings & { default?: boolean }) | undefined;
    try {
        settingsFromFile = JSON.parse(readFileSync(settingsPath, "utf-8"));
        settingsFromFile!.default = false;
    } catch (e) {
        if (e.code !== "ENOENT") {
            console.error(`CODE00000280 Couldn't read '${settingsPath}' because of error\n`, e);
        }
    }

    const settings = deepMerge(deepMerge(defaultSettings(), settingsFromFile || {}), opts || {});

    const env = Object.assign(pthis, {
        settings,
        //        dbProvider,
    } as OneApiServerEnv);

    if (!env.settings.port) throw new Error(`CODE00000183 No port specified!`);

    //    const sspiInstance = nodeSSPI({ retrieveGroups: false });
    const app = express();
    // app.use(cors());
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

    //app.use(express.static("public"));

    publishOneApis(env, app);

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
