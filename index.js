'use strict';

var deepMerge = require('deepmerge');
var fs = require('fs');
var path = require('path');
var ystd = require('ystd');
var express = require('express');
var ystd_server = require('ystd_server');
var jsonTypeValidation = require('@mojotech/json-type-validation');
var http = require('http');
var cors = require('cors');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var deepMerge__default = /*#__PURE__*/_interopDefaultLegacy(deepMerge);
var express__default = /*#__PURE__*/_interopDefaultLegacy(express);
var http__default = /*#__PURE__*/_interopDefaultLegacy(http);
var cors__default = /*#__PURE__*/_interopDefaultLegacy(cors);

jsonTypeValidation.object({
    ok: jsonTypeValidation.boolean(),
    error: jsonTypeValidation.optional(jsonTypeValidation.string()),
});
const decoderOneGetApiRequest = jsonTypeValidation.object({
    dataVersionOnly: jsonTypeValidation.optional(jsonTypeValidation.string()),
});
const decoderOneGetApiResponse = jsonTypeValidation.object({
    ok: jsonTypeValidation.boolean(),
    error: jsonTypeValidation.optional(jsonTypeValidation.string()),
    dataVersion: jsonTypeValidation.string(),
    data: jsonTypeValidation.optional(jsonTypeValidation.anyJson()),
});
const decoderOneSaveApiRequest = jsonTypeValidation.object({
    data: jsonTypeValidation.anyJson(),
    prevDataVersion: jsonTypeValidation.string(),
    newDataVersion: jsonTypeValidation.string(),
});
const decoderOneSaveApiResponse = jsonTypeValidation.object({
    ok: jsonTypeValidation.boolean(),
    error: jsonTypeValidation.optional(jsonTypeValidation.string()),
});

ystd.debugMsgFactory("oneApi");
const dataPath = "./data";
const dataFileName = "data.json";
const dataFilePath = path.join(dataPath, dataFileName);
const conflictsPath = path.join(dataPath, "conflicts");
const backupPath = path.join(dataPath, "backups");
function conflictsFilePath(skippedVersion) {
    return path.join(conflictsPath, skippedVersion.split("-").join("") + "_" + dataFileName);
}
function backupFileName(ts) {
    return ts.toString().split(":").join("-").split(" ").join("_") + "_" + dataFileName;
}
const BACKUP_INTERVAL = 1 * 60 * 60 * 1000;
const MAX_BACKUPS = 500;
function publishOneApis(env, app) {
    app.get("/api/one", async function OneGetApi(req, res) {
        new Date().toISOString();
        let error = "CODE00000101 Unknown error";
        try {
            const { dataVersionOnly } = {
                dataVersionOnly: "0",
                ...decoderOneGetApiRequest.runWithException(req.query || {}),
            };
            let parsed;
            try {
                const content = fs.readFileSync(dataFilePath, "utf-8");
                parsed = JSON.parse(content);
            }
            catch (e) {
                parsed = undefined;
            }
            if (!parsed?.data) {
                if (!parsed)
                    parsed = {};
                parsed.data = {};
                parsed.dataVersion = ystd.newId();
                ystd_server.writeFileSyncIfChanged(dataFilePath, JSON.stringify(parsed, undefined, "    "));
            }
            if (!parsed.data.ts)
                parsed.data.ts = "2000-01-01 00:00:00";
            const { data, dataVersion } = parsed;
            return res.send(JSON.stringify(decoderOneGetApiResponse.runWithException({
                ok: true,
                data: dataVersionOnly === "1" || dataVersionOnly === "true" ? undefined : data,
                dataVersion,
            })));
        }
        catch (e) {
            error = "CODE00000202 " + e.message + "\nat=" + e.at || "" + "\n\n" + e.stack;
            console.error(error);
        }
        return res.send(JSON.stringify({
            ok: false,
            error,
        }));
    });
    app.post("/api/one", async function OneSaveApi(req, res) {
        new Date().toISOString();
        let error = "CODE00000104 Unknown error";
        try {
            let parsed;
            let oldContent;
            try {
                const oldContent = fs.readFileSync(dataFilePath, "utf-8");
                parsed = JSON.parse(oldContent);
            }
            catch (e) {
                parsed = undefined;
            }
            const prevFileContent = {
                data: {},
                dataVersion: ystd.newId(),
                ...parsed,
            };
            if (!prevFileContent.data.ts)
                prevFileContent.data.ts = "2000-01-01 00:00:00";
            const oldData = prevFileContent.data;
            const oldDataVersion = prevFileContent.dataVersion;
            const oldTs = prevFileContent.dataTs;
            if (oldContent && oldContent.length && ystd.dateDiff(parsed.data.ts, new Date()) > BACKUP_INTERVAL) ;
            const { data, prevDataVersion, newDataVersion } = decoderOneSaveApiRequest.runWithException(req.body.params);
            if (!data?.tasks?.length)
                throw new Error(`CODE00000026 Can't save empty task list!`);
            if (!data.ts)
                data.ts = new Date().toISOString();
            const newFileContent = JSON.stringify({ data, dataVersion: newDataVersion }, undefined, "    ");
            if (!data.ts)
                data.ts = new Date().toISOString();
            const newDataTs = data.ts;
            let reverseConflict = oldTs >= newDataTs;
            if (oldContent && oldContent.length && oldDataVersion !== prevDataVersion) ;
            if (!reverseConflict) {
                ystd_server.writeFileSyncIfChanged(dataFilePath, newFileContent);
            }
            return res.send(JSON.stringify(decoderOneSaveApiResponse.runWithException({
                ok: true,
            })));
        }
        catch (e) {
            error = "CODE00000310 " + e.message;
            console.error(error);
        }
        return res.send(JSON.stringify({
            ok: false,
            error,
        }));
    });
}

function publishApis(env, app) {
    publishOneApis(env, app);
}

ystd.debugMsgFactory("startup");
const defaultSettings = () => ({
    port: 4300,
    instanceName: "unnamed",
    noDbTest: false,
});
const startApiServer = async (args) => {
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
    ystd.yconsole.log(`CODE00000094`, `Starting ysurvey...`);
    const settingsPath = path.resolve("./settings.json");
    ystd.yconsole.log(`CODE00000197`, `settingsPath = ${settingsPath}`);
    const settings = deepMerge__default['default'](defaultSettings(), JSON.parse(fs.readFileSync(settingsPath, "utf-8")));
    if (settings.port)
        ystd.yconsole.log(`CODE00000198`, `Api server on port ${settings.port}`);
    let v = {};
    try {
        v = JSON.parse(fs.readFileSync("version.json", "utf-8"));
    }
    catch (e) {
        if (e.code !== "ENOENT")
            throw e;
    }
    const versionStr = `${v.major || 0}.${v.minor || 0}.${v.build || 0}`;
    ystd.yconsole.log(`CODE00000199`, `version = ${versionStr}`);
    ystd.yconsole.log(`CODE00000307`, `Load settings - finished`);
    const env = Object.assign(pthis, {
        versionStr,
        args,
        settings,
    });
    ystd.yconsole.log(`CODE00000284`, `startApiServer`);
    if (!env.settings.port)
        throw new Error(`CODE00000183 No port specified!`);
    const app = express__default['default']();
    app.use(cors__default['default']());
    if (!process.argv.join(" ").includes("--devuser=")) ;
    else {
        console.log(`CODE00000291 devuser is set! No SSPI! ${process.argv.join(" ")}`);
    }
    app.use(express__default['default'].json());
    app.use(express__default['default'].static("public"));
    publishApis(env, app);
    let httpServer = http__default['default'].createServer(app);
    const httpServerInstance = httpServer.listen(env.settings.port, () => {
        console.log(`CODE00000282`, `Started /runStatus and /api/runStatus monitor endpoint on port ${env.settings.port}...`);
        ystd.yconsole.log(`CODE00000283`, `Started /runStatus and /api/runStatus monitor endpoint on port ${env.settings.port}...`);
    });
    env.onTerminateCallbacks.push(() => {
        httpServerInstance.close();
    });
    ystd.yconsole.log(`CODE00000279`, `startEnv - finished`);
    return env;
};

startApiServer();
//# sourceMappingURL=index.js.map
