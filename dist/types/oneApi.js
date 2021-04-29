import { anyJson, boolean, object, optional, string } from "@mojotech/json-type-validation";
export const decoderAckPacket = object({
    ok: boolean(),
    error: optional(string()),
});
export const decoderOneGetApiRequest = object({
    dataVersionOnly: optional(string()),
});
export const decoderOneGetApiResponse = object({
    ok: boolean(),
    error: optional(string()),
    dataVersion: string(),
    data: optional(anyJson()),
});
export const decoderOneSaveApiRequest = object({
    data: anyJson(),
    prevDataVersion: string(),
    newDataVersion: string(),
});
export const decoderOneSaveApiResponse = object({
    ok: boolean(),
    error: optional(string()),
});
//----------------------------------------------------------------------------------------------------
//# sourceMappingURL=oneApi.js.map