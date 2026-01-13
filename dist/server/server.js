import { ConfigurationError } from '../errors/index.js';
import { NetworkConfig, ContractReader, HookDataCodec, } from '../shared/index.js';
/**
 * X402 Server for registering and exposing x402 services
 */
export class X402Server {
    config;
    services = new Map();
    contractReader;
    networkSettings;
    constructor(config) {
        this.validateConfig(config);
        this.config = config;
        this.networkSettings = NetworkConfig.getConfig(config.network, config.rpcUrl);
        this.contractReader = new ContractReader(this.networkSettings.rpcUrl);
    }
    /**
     * Validate server configuration
     */
    validateConfig(config) {
        const missingFields = [];
        if (!config.name)
            missingFields.push('name');
        if (!config.url)
            missingFields.push('url');
        if (!config.network)
            missingFields.push('network');
        if (missingFields.length > 0) {
            throw new ConfigurationError(`Missing required configuration fields: ${missingFields.join(', ')}`, missingFields);
        }
        if (!NetworkConfig.isValidNetwork(config.network)) {
            throw new ConfigurationError(`Invalid network: ${config.network}. Must be 'cronos' or 'cronos-testnet'`);
        }
    }
    /**
     * Register a new x402 service
     */
    async addService(serviceConfig) {
        // Validate required fields
        const missingFields = [];
        if (!serviceConfig.id)
            missingFields.push('id');
        if (!serviceConfig.hookAddress)
            missingFields.push('hookAddress');
        if (!serviceConfig.hookType)
            missingFields.push('hookType');
        if (!serviceConfig.network)
            missingFields.push('network');
        if (missingFields.length > 0) {
            throw new ConfigurationError(`Missing required service fields: ${missingFields.join(', ')}`, missingFields);
        }
        // Validate hook contract exists and read settlement router
        const settlementRouter = await this.contractReader.getSettlementRouter(serviceConfig.hookAddress);
        // Build full service object
        const service = {
            ...serviceConfig,
            settlementRouter,
            usdcAddress: this.networkSettings.usdcAddress,
            chainId: this.networkSettings.chainId,
        };
        this.services.set(serviceConfig.id, service);
    }
    /**
     * Get a service by ID
     */
    getService(id) {
        return this.services.get(id);
    }
    /**
     * List all registered services
     */
    listServices() {
        return Array.from(this.services.values());
    }
    /**
     * Generate agent card for service discovery
     */
    getAgentCard() {
        return {
            name: this.config.name,
            description: this.config.description,
            url: this.config.url,
            services: this.listServices(),
        };
    }
    /**
     * Get service response with hookData schema
     */
    getServiceResponse(service) {
        return {
            ...service,
            hookDataSchema: HookDataCodec.getSchema(service.hookType),
        };
    }
    /**
     * Create Express middleware for x402 endpoints
     */
    expressMiddleware(router) {
        // Agent card endpoint
        router.get('/.well-known/agent.json', (_req, res) => {
            res.json(this.getAgentCard());
        });
        // List all services
        router.get('/api/x402/services', (_req, res) => {
            const services = this.listServices().map((s) => this.getServiceResponse(s));
            res.json({ services });
        });
        // Get single service by ID
        router.get('/api/x402/services/:id', (req, res) => {
            const serviceId = req.params.id;
            const service = this.getService(serviceId);
            if (!service) {
                res.status(404).json({
                    error: 'Service not found',
                    message: `No service found with ID: ${req.params.id}`,
                });
                return;
            }
            res.json(this.getServiceResponse(service));
        });
        return router;
    }
    /**
     * Get server configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Get network settings
     */
    getNetworkSettings() {
        return { ...this.networkSettings };
    }
}
/**
 * Create a new X402 server instance
 */
export function createX402Server(config) {
    return new X402Server(config);
}
//# sourceMappingURL=server.js.map