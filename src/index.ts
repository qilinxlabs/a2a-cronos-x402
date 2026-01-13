// ============================================================================
// Server Exports
// ============================================================================

export { X402Server, createX402Server } from './server/index.js';
export type { X402ServerConfig } from './server/index.js';

// ============================================================================
// Client Exports
// ============================================================================

export { X402Client, createX402Client } from './client/index.js';
export type { X402ClientConfig } from './client/index.js';

// ============================================================================
// Shared Types
// ============================================================================

export type {
  // Network types
  CronosNetwork,
  NetworkSettings,
  // Hook types
  HookType,
  HookDataParams,
  NFTMintHookData,
  RewardPointsHookData,
  TransferSplitHookData,
  HookDataSchema,
  // Service types
  X402ServiceConfig,
  X402Service,
  AgentCard,
  DiscoveredServices,
  // Transaction types
  TransactionParams,
  PreparedTransaction,
  TransactionResult,
  TransactionEvent,
  EIP712TypedData,
  TokenInfo,
} from './shared/types.js';

// ============================================================================
// Shared Utilities
// ============================================================================

export { NetworkConfig, NETWORK_CONFIGS } from './shared/network-config.js';
export { HookDataCodec } from './shared/hook-data-codec.js';
export { ContractReader } from './shared/contract-reader.js';
export type { CommitmentParams } from './shared/contract-reader.js';

// ============================================================================
// Error Classes
// ============================================================================

export {
  X402Error,
  ContractNotFoundError,
  SignatureError,
  TransactionError,
  NetworkError,
  ConfigurationError,
} from './errors/index.js';
