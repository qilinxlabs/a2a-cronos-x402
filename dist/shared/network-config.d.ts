import type { CronosNetwork, NetworkSettings } from './types.js';
/**
 * Default network configurations for Cronos networks
 */
export declare const NETWORK_CONFIGS: Record<CronosNetwork, NetworkSettings>;
/**
 * Utility class for network configuration management
 */
export declare class NetworkConfig {
    /**
     * Get RPC URL for a network, with optional custom override
     */
    static getRpcUrl(network: CronosNetwork, customUrl?: string): string;
    /**
     * Get chain ID for a network
     */
    static getChainId(network: CronosNetwork): number;
    /**
     * Get USDC address for a network
     */
    static getUsdcAddress(network: CronosNetwork): string;
    /**
     * Get block explorer URL for a network
     */
    static getBlockExplorer(network: CronosNetwork): string;
    /**
     * Get full default configuration for a network
     */
    static getDefaultConfig(network: CronosNetwork): NetworkSettings;
    /**
     * Get configuration with optional custom RPC URL override
     */
    static getConfig(network: CronosNetwork, customRpcUrl?: string): NetworkSettings;
    /**
     * Check if a network is valid
     */
    static isValidNetwork(network: string): network is CronosNetwork;
}
//# sourceMappingURL=network-config.d.ts.map