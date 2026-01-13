/**
 * Base error class for all x402 library errors
 */
export class X402Error extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
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
  constructor(public readonly address: string) {
    super(`Contract not found at address: ${address}`, 'CONTRACT_NOT_FOUND');
    this.name = 'ContractNotFoundError';
  }
}

/**
 * Thrown when signature validation fails
 */
export class SignatureError extends X402Error {
  constructor(
    message: string,
    public readonly details?: string
  ) {
    super(message, 'SIGNATURE_ERROR');
    this.name = 'SignatureError';
  }
}

/**
 * Thrown when a transaction fails or reverts
 */
export class TransactionError extends X402Error {
  constructor(
    message: string,
    public readonly txHash?: string,
    public readonly revertReason?: string
  ) {
    super(message, 'TRANSACTION_ERROR');
    this.name = 'TransactionError';
  }
}

/**
 * Thrown when network connectivity fails
 */
export class NetworkError extends X402Error {
  constructor(
    message: string,
    public readonly url?: string,
    public readonly status?: number
  ) {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

/**
 * Thrown when required configuration is missing or invalid
 */
export class ConfigurationError extends X402Error {
  constructor(
    message: string,
    public readonly missingFields?: string[]
  ) {
    super(message, 'CONFIGURATION_ERROR');
    this.name = 'ConfigurationError';
  }
}
