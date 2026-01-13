import type { Router } from 'express';
import type { CronosNetwork, X402ServiceConfig, X402Service, AgentCard } from '../shared/types.js';
/**
 * Server configuration
 */
export interface X402ServerConfig {
    name: string;
    description?: string;
    url: string;
    network: CronosNetwork;
    rpcUrl?: string;
}
/**
 * X402 Server for registering and exposing x402 services
 */
export declare class X402Server {
    private config;
    private services;
    private contractReader;
    private networkSettings;
    constructor(config: X402ServerConfig);
    /**
     * Validate server configuration
     */
    private validateConfig;
    /**
     * Register a new x402 service
     */
    addService(serviceConfig: X402ServiceConfig): Promise<void>;
    /**
     * Get a service by ID
     */
    getService(id: string): X402Service | undefined;
    /**
     * List all registered services
     */
    listServices(): X402Service[];
    /**
     * Generate agent card for service discovery
     */
    getAgentCard(): AgentCard;
    /**
     * Get service response with hookData schema
     */
    private getServiceResponse;
    /**
     * Create Express middleware for x402 endpoints
     */
    expressMiddleware(router: Router): Router;
    /**
     * Get server configuration
     */
    getConfig(): X402ServerConfig;
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
 * Create a new X402 server instance
 */
export declare function createX402Server(config: X402ServerConfig): X402Server;
//# sourceMappingURL=server.d.ts.map