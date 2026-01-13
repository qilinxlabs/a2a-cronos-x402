/**
 * Base error class for all x402 library errors
 */
export declare class X402Error extends Error {
    readonly code: string;
    constructor(message: string, code: string);
}
/**
 * Thrown when a contract is not found at the specified address
 */
export declare class ContractNotFoundError extends X402Error {
    readonly address: string;
    constructor(address: string);
}
/**
 * Thrown when signature validation fails
 */
export declare class SignatureError extends X402Error {
    readonly details?: string | undefined;
    constructor(message: string, details?: string | undefined);
}
/**
 * Thrown when a transaction fails or reverts
 */
export declare class TransactionError extends X402Error {
    readonly txHash?: string | undefined;
    readonly revertReason?: string | undefined;
    constructor(message: string, txHash?: string | undefined, revertReason?: string | undefined);
}
/**
 * Thrown when network connectivity fails
 */
export declare class NetworkError extends X402Error {
    readonly url?: string | undefined;
    readonly status?: number | undefined;
    constructor(message: string, url?: string | undefined, status?: number | undefined);
}
/**
 * Thrown when required configuration is missing or invalid
 */
export declare class ConfigurationError extends X402Error {
    readonly missingFields?: string[] | undefined;
    constructor(message: string, missingFields?: string[] | undefined);
}
//# sourceMappingURL=index.d.ts.map