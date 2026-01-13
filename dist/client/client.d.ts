import type { CronosNetwork, DiscoveredServices, TransactionParams, PreparedTransaction, TransactionResult, EIP712TypedData, HookDataParams } from '../shared/types.js';
/**
 * Client configuration
 */
export interface X402ClientConfig {
    network: CronosNetwork;
    rpcUrl?: string;
}
/**
 * X402 Client for discovering services and executing transactions
 */
export declare class X402Client {
    private contractReader;
    private networkSettings;
    constructor(config: X402ClientConfig);
    /**
     * Validate client configuration
     */
    private validateConfig;
    /**
     * Discover services from a server
     */
    discover(serverUrl: string): Promise<DiscoveredServices>;
    /**
     * Discover services from multiple servers
     */
    discoverAll(serverUrls: string[]): Promise<DiscoveredServices[]>;
    /**
     * Prepare a transaction for signing
     */
    prepareTransaction(params: TransactionParams): Promise<PreparedTransaction>;
    /**
     * Validate signature format
     */
    validateSignature(signature: string): boolean;
    /**
     * Submit a signed transaction
     */
    submitTransaction(prepared: PreparedTransaction, signature: string, signerPrivateKey: string): Promise<TransactionResult>;
    /**
     * Get the typed data for wallet signing (convenience method)
     */
    getTypedDataForSigning(prepared: PreparedTransaction): EIP712TypedData;
    /**
     * Encode hook data (convenience method)
     */
    encodeHookData(hookDataParams: HookDataParams): string;
    /**
     * Get network settings
     */
    getNetworkSettings(): {
        chainId: number;
        rpcUrl: string;
        usdcAddress: string;
        blockExplorer: string;
    };
}
/**
 * Create a new X402 client instance
 */
export declare function createX402Client(config: X402ClientConfig): X402Client;
//# sourceMappingURL=client.d.ts.map