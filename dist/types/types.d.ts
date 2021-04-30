import { Decoder } from "@mojotech/json-type-validation";
export interface AckPacket {
    ok: boolean;
    error?: string;
}
export declare const decoderAckPacket: Decoder<AckPacket>;
export interface OneGetApiRequest {
    dataVersionOnly?: string;
}
export declare const decoderOneGetApiRequest: Decoder<OneGetApiRequest>;
export interface OneApiDataAndFields {
    data: any;
    dataVersion: string;
}
export interface OneGetApiResponse extends AckPacket {
    data: any;
    dataVersion: string;
}
export declare const decoderOneGetApiResponse: Decoder<OneGetApiResponse>;
export interface OneSaveApiRequest {
    data: any;
    prevDataVersion: string;
    newDataVersion: string;
}
export declare const decoderOneSaveApiRequest: Decoder<OneSaveApiRequest>;
export interface OneSaveApiResponse extends AckPacket {
}
export declare const decoderOneSaveApiResponse: Decoder<OneSaveApiResponse>;
//# sourceMappingURL=types.d.ts.map