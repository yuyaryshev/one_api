import { ManageableTimer } from "ystd";
export interface EnvSettings {
    default?: boolean;
    port: number;
}
export declare const defaultSettings: () => EnvSettings;
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
export declare const startApiServer: (args?: any) => Promise<Env>;
//# sourceMappingURL=index.d.ts.map