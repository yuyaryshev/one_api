import { anyJson, boolean, Decoder, object, optional, string } from "@mojotech/json-type-validation";

export interface AckPacket {
    ok: boolean;
    error?: string;
}

export const decoderAckPacket: Decoder<AckPacket> = object({
    ok: boolean(),
    error: optional(string()),
});

//----------------------------------------------------------------------------------------------------
export interface OneGetApiRequest {
    dataVersionOnly?: string;
}
export const decoderOneGetApiRequest: Decoder<OneGetApiRequest> = object({
    dataVersionOnly: optional(string()),
});

export interface OneApiDataAndFields {
    data: any;
    dataVersion: string;
}

export interface OneGetApiResponse extends AckPacket {
    data: any;
    dataVersion: string;
}
export const decoderOneGetApiResponse: Decoder<OneGetApiResponse> = object({
    ok: boolean(),
    error: optional(string()),
    dataVersion: string(),
    data: optional(anyJson()),
});
//----------------------------------------------------------------------------------------------------
export interface OneSaveApiRequest {
    data: any;
    prevDataVersion: string;
    newDataVersion: string;
}
export const decoderOneSaveApiRequest: Decoder<OneSaveApiRequest> = object({
    data: anyJson(),
    prevDataVersion: string(),
    newDataVersion: string(),
});

export interface OneSaveApiResponse extends AckPacket {}
export const decoderOneSaveApiResponse: Decoder<OneSaveApiResponse> = object({
    ok: boolean(),
    error: optional(string()),
});
//----------------------------------------------------------------------------------------------------
