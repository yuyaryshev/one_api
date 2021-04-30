import { ManageableTimer } from "ystd";
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
export interface Env {
    terminating: boolean;
    onTerminateCallbacks: (() => void)[];
    versionStr: string;
    args: any;
    settings: OneApiSettings;
    timers: Set<ManageableTimer>;
    terminate: () => void | Promise<void>;
}
export interface IssueLoaderVersion {
    major?: number;
    minor?: number;
    build?: number;
}
export declare function mergeOneApiEnv<T>(inputEnv?: T): ({
    onTerminateCallbacks: (() => void)[];
    terminating: boolean;
    timers: Set<any>;
    terminate: () => void;
} | T) & {
    onTerminateCallbacks: (() => void)[];
    terminating: boolean;
    timers: Set<ManageableTimer<import("ystd").EnvWithTimers>>;
    terminate: () => void;
};
export declare const startOneApiServer: (opts?: OneApiSettings | undefined) => Promise<Env>;
//# sourceMappingURL=index.d.ts.map