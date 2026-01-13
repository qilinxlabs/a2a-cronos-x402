import type { HookType, HookDataParams, HookDataSchema } from './types.js';
/**
 * Codec for encoding and decoding hookData for different hook types
 */
export declare class HookDataCodec {
    private static abiCoder;
    /**
     * Encode hook data parameters to ABI-encoded bytes
     */
    static encode(hookType: HookType, params: HookDataParams): string;
    /**
     * Decode ABI-encoded hookData back to parameters
     */
    static decode(hookType: HookType, hookData: string): HookDataParams;
    /**
     * Get the encoding schema for a hook type
     */
    static getSchema(hookType: HookType): HookDataSchema;
    /**
     * Validate hook data parameters
     */
    static validate(params: HookDataParams): boolean;
}
//# sourceMappingURL=hook-data-codec.d.ts.map