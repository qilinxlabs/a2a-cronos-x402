import { ethers } from 'ethers';
import type { TokenInfo } from './types.js';
/**
 * ABI for reading settlement router from hook contracts
 */
declare const HOOK_ABI: string[];
/**
 * ABI for SettlementRouter contract
 */
declare const SETTLEMENT_ROUTER_ABI: string[];
/**
 * ABI for EIP-3009 token (USDC)
 */
declare const TOKEN_ABI: string[];
/**
 * Parameters for calculating commitment
 */
export interface CommitmentParams {
    token: string;
    from: string;
    value: bigint;
    validAfter: number;
    validBefore: number;
    salt: string;
    payTo: string;
    facilitatorFee: bigint;
    hook: string;
    hookData: string;
}
/**
 * Utility class for reading data from on-chain contracts
 */
export declare class ContractReader {
    private provider;
    constructor(rpcUrl: string);
    /**
     * Read the settlement router address from a hook contract
     */
    getSettlementRouter(hookAddress: string): Promise<string>;
    /**
     * Calculate commitment (nonce) for a transaction
     */
    calculateCommitment(routerAddress: string, params: CommitmentParams): Promise<string>;
    /**
     * Get token info for EIP-712 domain
     */
    getTokenInfo(tokenAddress: string): Promise<TokenInfo>;
    /**
     * Check if a contract exists at an address
     */
    contractExists(address: string): Promise<boolean>;
    /**
     * Get the underlying provider
     */
    getProvider(): ethers.JsonRpcProvider;
}
export { SETTLEMENT_ROUTER_ABI, HOOK_ABI, TOKEN_ABI };
//# sourceMappingURL=contract-reader.d.ts.map