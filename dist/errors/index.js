/**
 * Base error class for all x402 library errors
 */
export class X402Error extends Error {
    code;
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'X402Error';
        // Maintains proper stack trace for where error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
/**
 * Thrown when a contract is not found at the specified address
 */
export class ContractNotFoundError extends X402Error {
    address;
    constructor(address) {
        super(`Contract not found at address: ${address}`, 'CONTRACT_NOT_FOUND');
        this.address = address;
        this.name = 'ContractNotFoundError';
    }
}
/**
 * Thrown when signature validation fails
 */
export class SignatureError extends X402Error {
    details;
    constructor(message, details) {
        super(message, 'SIGNATURE_ERROR');
        this.details = details;
        this.name = 'SignatureError';
    }
}
/**
 * Thrown when a transaction fails or reverts
 */
export class TransactionError extends X402Error {
    txHash;
    revertReason;
    constructor(message, txHash, revertReason) {
        super(message, 'TRANSACTION_ERROR');
        this.txHash = txHash;
        this.revertReason = revertReason;
        this.name = 'TransactionError';
    }
}
/**
 * Thrown when network connectivity fails
 */
export class NetworkError extends X402Error {
    url;
    status;
    constructor(message, url, status) {
        super(message, 'NETWORK_ERROR');
        this.url = url;
        this.status = status;
        this.name = 'NetworkError';
    }
}
/**
 * Thrown when required configuration is missing or invalid
 */
export class ConfigurationError extends X402Error {
    missingFields;
    constructor(message, missingFields) {
        super(message, 'CONFIGURATION_ERROR');
        this.missingFields = missingFields;
        this.name = 'ConfigurationError';
    }
}
//# sourceMappingURL=index.js.map