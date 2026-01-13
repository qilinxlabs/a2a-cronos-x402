/**
 * Supported Cronos networks
 */
export type CronosNetwork = 'cronos' | 'cronos-testnet';

/**
 * Network-specific configuration settings
 */
export interface NetworkSettings {
  chainId: number;
  rpcUrl: string;
  usdcAddress: string;
  blockExplorer: string;
}

/**
 * Hook types supported by the x402 protocol
 */
export type HookType = 'nft-mint' | 'reward-points' | 'transfer-split';

/**
 * Service configuration for registering x402 services
 */
export interface X402ServiceConfig {
  id: string;
  title: string;
  description?: string;
  hookType: HookType;
  hookAddress: string;
  network: CronosNetwork;
  supportingContracts?: {
    nftContract?: string;
    rewardToken?: string;
  };
  defaults?: {
    paymentAmount: string;
    facilitatorFee: string;
    payTo: string;
  };
}

/**
 * Full service object with resolved on-chain data
 */
export interface X402Service extends X402ServiceConfig {
  settlementRouter: string;
  usdcAddress: string;
  chainId: number;
}

/**
 * NFT mint hook data parameters
 */
export interface NFTMintHookData {
  type: 'nft-mint';
  nftContract: string;
}

/**
 * Reward points hook data parameters
 */
export interface RewardPointsHookData {
  type: 'reward-points';
  rewardToken: string;
}

/**
 * Transfer/split hook data parameters
 */
export interface TransferSplitHookData {
  type: 'transfer-split';
  splits?: Array<{
    recipient: string;
    bips: number;
  }>;
}

/**
 * Union type for all hook data parameters
 */
export type HookDataParams = NFTMintHookData | RewardPointsHookData | TransferSplitHookData;

/**
 * Schema describing how to encode hookData for a hook type
 */
export interface HookDataSchema {
  hookType: HookType;
  abiType: string;
  description: string;
  example: string;
}

/**
 * Parameters for preparing a transaction
 */
export interface TransactionParams {
  service: X402Service;
  payerAddress: string;
  payTo: string;
  paymentAmount: string;
  facilitatorFee?: string;
  hookDataParams: HookDataParams;
  validitySeconds?: number;
}

/**
 * EIP-712 typed data structure
 */
export interface EIP712TypedData {
  types: {
    EIP712Domain: Array<{ name: string; type: string }>;
    TransferWithAuthorization: Array<{ name: string; type: string }>;
  };
  primaryType: 'TransferWithAuthorization';
  domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
  };
  message: {
    from: string;
    to: string;
    value: string;
    validAfter: string;
    validBefore: string;
    nonce: string;
  };
}

/**
 * Prepared transaction ready for signing
 */
export interface PreparedTransaction {
  typedData: EIP712TypedData;
  routerAddress: string;
  nonce: string;
  salt: string;
  hookData: string;
  params: {
    token: string;
    from: string;
    value: bigint;
    validAfter: number;
    validBefore: number;
    payTo: string;
    facilitatorFee: bigint;
    hook: string;
  };
}

/**
 * Event emitted during transaction execution
 */
export interface TransactionEvent {
  name: string;
  args: Record<string, unknown>;
}

/**
 * Result of a submitted transaction
 */
export interface TransactionResult {
  success: boolean;
  txHash: string;
  blockNumber: number;
  events: TransactionEvent[];
  error?: string;
}

/**
 * Token info for EIP-712 domain
 */
export interface TokenInfo {
  name: string;
  version: string;
}

/**
 * Agent card for service discovery
 */
export interface AgentCard {
  name: string;
  description?: string;
  url: string;
  services: X402Service[];
}

/**
 * Discovered services from a server
 */
export interface DiscoveredServices {
  serverUrl: string;
  agentCard: AgentCard;
  services: X402Service[];
  error?: string;
}
