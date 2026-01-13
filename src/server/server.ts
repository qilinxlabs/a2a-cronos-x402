import type { Router, Request, Response } from 'express';
import { ConfigurationError } from '../errors/index.js';
import {
  NetworkConfig,
  ContractReader,
  HookDataCodec,
} from '../shared/index.js';
import type {
  CronosNetwork,
  X402ServiceConfig,
  X402Service,
  AgentCard,
} from '../shared/types.js';

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
export class X402Server {
  private config: X402ServerConfig;
  private services: Map<string, X402Service> = new Map();
  private contractReader: ContractReader;
  private networkSettings: ReturnType<typeof NetworkConfig.getConfig>;

  constructor(config: X402ServerConfig) {
    this.validateConfig(config);
    this.config = config;
    this.networkSettings = NetworkConfig.getConfig(config.network, config.rpcUrl);
    this.contractReader = new ContractReader(this.networkSettings.rpcUrl);
  }

  /**
   * Validate server configuration
   */
  private validateConfig(config: X402ServerConfig): void {
    const missingFields: string[] = [];
    if (!config.name) missingFields.push('name');
    if (!config.url) missingFields.push('url');
    if (!config.network) missingFields.push('network');

    if (missingFields.length > 0) {
      throw new ConfigurationError(
        `Missing required configuration fields: ${missingFields.join(', ')}`,
        missingFields
      );
    }

    if (!NetworkConfig.isValidNetwork(config.network)) {
      throw new ConfigurationError(
        `Invalid network: ${config.network}. Must be 'cronos' or 'cronos-testnet'`
      );
    }
  }

  /**
   * Register a new x402 service
   */
  async addService(serviceConfig: X402ServiceConfig): Promise<void> {
    // Validate required fields
    const missingFields: string[] = [];
    if (!serviceConfig.id) missingFields.push('id');
    if (!serviceConfig.hookAddress) missingFields.push('hookAddress');
    if (!serviceConfig.hookType) missingFields.push('hookType');
    if (!serviceConfig.network) missingFields.push('network');

    if (missingFields.length > 0) {
      throw new ConfigurationError(
        `Missing required service fields: ${missingFields.join(', ')}`,
        missingFields
      );
    }

    // Validate hook contract exists and read settlement router
    const settlementRouter = await this.contractReader.getSettlementRouter(
      serviceConfig.hookAddress
    );

    // Build full service object
    const service: X402Service = {
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
  getService(id: string): X402Service | undefined {
    return this.services.get(id);
  }

  /**
   * List all registered services
   */
  listServices(): X402Service[] {
    return Array.from(this.services.values());
  }

  /**
   * Generate agent card for service discovery
   */
  getAgentCard(): AgentCard {
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
  private getServiceResponse(service: X402Service) {
    return {
      ...service,
      hookDataSchema: HookDataCodec.getSchema(service.hookType),
    };
  }

  /**
   * Create Express middleware for x402 endpoints
   */
  expressMiddleware(router: Router): Router {
    // Agent card endpoint
    router.get('/.well-known/agent.json', (_req: Request, res: Response) => {
      res.json(this.getAgentCard());
    });

    // List all services
    router.get('/api/x402/services', (_req: Request, res: Response) => {
      const services = this.listServices().map((s) => this.getServiceResponse(s));
      res.json({ services });
    });

    // Get single service by ID
    router.get('/api/x402/services/:id', (req: Request, res: Response) => {
      const serviceId = req.params.id as string;
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
  getConfig(): X402ServerConfig {
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
export function createX402Server(config: X402ServerConfig): X402Server {
  return new X402Server(config);
}
