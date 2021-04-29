import { Env } from "../../index.js";
import { Express } from "express";
import { publishOneApis } from "./oneApi.js";

export function publishApis(env: Env, app: Express) {
    publishOneApis(env, app);
}
