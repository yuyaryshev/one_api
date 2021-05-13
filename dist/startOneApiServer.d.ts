import { EnvBase } from "ystd_server/dist";
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
export declare const defaultSettings: () => OneApiSettings;
export interface OneApiEnv<SettingsT extends OneApiSettings = OneApiSettings> {
    settings: SettingsT;
}
export declare type OneApiServerEnv = OneApiEnv & EnvBase;
export interface IssueLoaderVersion {
    major?: number;
    minor?: number;
    build?: number;
}
export declare const startOneApiServer: (opts?: OneApiSettings | undefined) => Promise<OneApiServerEnv>;
//# sourceMappingURL=startOneApiServer.d.ts.map