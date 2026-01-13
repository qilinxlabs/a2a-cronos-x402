/**
 * Default network configurations for Cronos networks
 */
export const NETWORK_CONFIGS = {
    cronos: {
        chainId: 25,
        rpcUrl: 'https://evm.cronos.org',
        usdcAddress: '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59',
        blockExplorer: 'https://explorer.cronos.org',
    },
    'cronos-testnet': {
        chainId: 338,
        rpcUrl: 'https://evm-t3.cronos.org',
        usdcAddress: '0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0',
        blockExplorer: 'https://explorer.cronos.org/testnet',
    },
};
/**
 * Utility class for network configuration management
 */
export class NetworkConfig {
    /**
     * Get RPC URL for a network, with optional custom override
     */
    static getRpcUrl(network, customUrl) {
        if (customUrl) {
            return customUrl;
        }
        return NETWORK_CONFIGS[network].rpcUrl;
    }
    /**
     * Get chain ID for a network
     */
    static getChainId(network) {
        return NETWORK_CONFIGS[network].chainId;
    }
    /**
     * Get USDC address for a network
     */
    static getUsdcAddress(network) {
        return NETWORK_CONFIGS[network].usdcAddress;
    }
    /**
     * Get block explorer URL for a network
     */
    static getBlockExplorer(network) {
        return NETWORK_CONFIGS[network].blockExplorer;
    }
    /**
     * Get full default configuration for a network
     */
    static getDefaultConfig(network) {
        return { ...NETWORK_CONFIGS[network] };
    }
    /**
     * Get configuration with optional custom RPC URL override
     */
    static getConfig(network, customRpcUrl) {
        const config = this.getDefaultConfig(network);
        if (customRpcUrl) {
            config.rpcUrl = customRpcUrl;
        }
        return config;
    }
    /**
     * Check if a network is valid
     */
    static isValidNetwork(network) {
        return network === 'cronos' || network === 'cronos-testnet';
    }
}
//# sourceMappingURL=network-config.js.map