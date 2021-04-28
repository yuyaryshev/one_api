import { join } from "path";
import { dateDiff, debugMsgFactory as debugjs, newId as newGuid } from "ystd";
import { writeFileSerieSync, writeFileSyncIfChanged } from "ystd_server";
import { decoderOneGetApiRequest, decoderOneGetApiResponse, decoderOneSaveApiRequest, decoderOneSaveApiResponse, } from "../../types/oneApi";
import { readFileSync } from "fs";
const debug = debugjs("oneApi");
const dataPath = "./data";
const dataFileName = "data.json";
const dataFilePath = join(dataPath, dataFileName);
const conflictsPath = join(dataPath, "conflicts");
const backupPath = join(dataPath, "backups");
function conflictsFilePath(skippedVersion) {
    return join(conflictsPath, skippedVersion.split("-").join("") + "_" + dataFileName);
}
function backupFileName(ts) {
    return ts.toString().split(":").join("-").split(" ").join("_") + "_" + dataFileName;
}
const BACKUP_INTERVAL = 1 * 60 * 60 * 1000;
const MAX_BACKUPS = 500;
export function publishOneApis(env, app) {
    app.get("/api/one", async function OneGetApi(req, res) {
        const requestTs = new Date().toISOString();
        let error = "CODE00000101 Unknown error";
        let ok = false;
        try {
            const { dataVersionOnly } = {
                dataVersionOnly: "0",
                ...decoderOneGetApiRequest.runWithException(req.query || {}),
            };
            let parsed;
            try {
                const content = readFileSync(dataFilePath, "utf-8");
                parsed = JSON.parse(content);
            }
            catch (e) {
                parsed = undefined;
            }
            if (!parsed?.data) {
                if (!parsed)
                    parsed = {};
                parsed.data = {};
                parsed.dataVersion = newGuid();
                writeFileSyncIfChanged(dataFilePath, JSON.stringify(parsed, undefined, "    "));
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
        const requestTs = new Date().toISOString();
        let error = "CODE00000104 Unknown error";
        let ok = false;
        try {
            let parsed;
            let oldContent;
            try {
                const oldContent = readFileSync(dataFilePath, "utf-8");
                parsed = JSON.parse(oldContent);
            }
            catch (e) {
                parsed = undefined;
            }
            const prevFileContent = {
                data: {},
                dataVersion: newGuid(),
                ...parsed,
            };
            if (!prevFileContent.data.ts)
                prevFileContent.data.ts = "2000-01-01 00:00:00";
            const oldData = prevFileContent.data;
            const oldDataVersion = prevFileContent.dataVersion;
            const oldTs = prevFileContent.dataTs;
            if (oldContent && oldContent.length && dateDiff(parsed.data.ts, new Date()) > BACKUP_INTERVAL) {
                // BACKUP old files with specified interval
                const v_backupFileName = backupFileName(parsed.data.ts);
                writeFileSerieSync(backupPath, v_backupFileName, oldContent, MAX_BACKUPS);
            }
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
            if (oldContent && oldContent.length && oldDataVersion !== prevDataVersion) {
                if (!reverseConflict) {
                    // Backup old data as a conflict missing version
                    const v_conflictFilePath = conflictsFilePath(oldDataVersion);
                    writeFileSyncIfChanged(v_conflictFilePath, oldContent);
                }
                else {
                    // Backup data which received just now, but it was changed before my recent change as a conflict missing version
                    const v_conflictFilePath = conflictsFilePath(oldDataVersion);
                    writeFileSyncIfChanged(v_conflictFilePath, newFileContent);
                }
                // log conflict into the data
                if (!data.versionConflicts)
                    data.versionConflicts = [];
                data.versionConflicts.push({
                    actualPrev: oldDataVersion,
                    expectedPrev: prevDataVersion,
                    new: newDataVersion,
                    reverseConflict,
                });
            }
            if (!reverseConflict) {
                writeFileSyncIfChanged(dataFilePath, newFileContent);
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
//# sourceMappingURL=oneApi.js.map