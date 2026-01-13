import { ethers } from 'ethers';
import {
  NetworkError,
  SignatureError,
  TransactionError,
  ConfigurationError,
} from '../errors/index.js';
import {
  NetworkConfig,
  ContractReader,
  HookDataCodec,
  SETTLEMENT_ROUTER_ABI,
} from '../shared/index.js';
import type {
  CronosNetwork,
  AgentCard,
  DiscoveredServices,
  TransactionParams,
  PreparedTransaction,
  TransactionResult,
  EIP712TypedData,
  HookDataParams,
  TransactionEvent,
} from '../shared/types.js';

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
export class X402Client {
  private contractReader: ContractReader;
  private networkSettings: ReturnType<typeof NetworkConfig.getConfig>;

  constructor(config: X402ClientConfig) {
    this.validateConfig(config);
    this.networkSettings = NetworkConfig.getConfig(config.network, config.rpcUrl);
    this.contractReader = new ContractReader(this.networkSettings.rpcUrl);
  }

  /**
   * Validate client configuration
   */
  private validateConfig(config: X402ClientConfig): void {
    if (!config.network) {
      throw new ConfigurationError('Missing required field: network', ['network']);
    }
    if (!NetworkConfig.isValidNetwork(config.network)) {
      throw new ConfigurationError(
        `Invalid network: ${config.network}. Must be 'cronos' or 'cronos-testnet'`
      );
    }
  }

  /**
   * Discover services from a server
   */
  async discover(serverUrl: string): Promise<DiscoveredServices> {
    try {
      const agentCardUrl = `${serverUrl.replace(/\/$/, '')}/.well-known/agent.json`;
      const response = await fetch(agentCardUrl);

      if (!response.ok) {
        throw new NetworkError(
          `Failed to fetch agent card: ${response.statusText}`,
          agentCardUrl,
          response.status
        );
      }

      const agentCard = (await response.json()) as AgentCard;

      return {
        serverUrl,
        agentCard,
        services: agentCard.services,
      };
    } catch (error) {
      if (error instanceof NetworkError) {
        return {
          serverUrl,
          agentCard: { name: '', url: serverUrl, services: [] },
          services: [],
          error: error.message,
        };
      }
      return {
        serverUrl,
        agentCard: { name: '', url: serverUrl, services: [] },
        services: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Discover services from multiple servers
   */
  async discoverAll(serverUrls: string[]): Promise<DiscoveredServices[]> {
    const results = await Promise.all(
      serverUrls.map((url) => this.discover(url))
    );
    return results;
  }

  /**
   * Prepare a transaction for signing
   */
  async prepareTransaction(params: TransactionParams): Promise<PreparedTransaction> {
    const { service, payerAddress, payTo, paymentAmount, hookDataParams } = params;
    const facilitatorFee = params.facilitatorFee || '0';
    const validitySeconds = params.validitySeconds || 3600;

    // Encode hookData
    const hookData = HookDataCodec.encode(service.hookType, hookDataParams);

    // Generate salt
    const salt = ethers.hexlify(ethers.randomBytes(32));

    // Time bounds
    const validAfter = 0;
    const validBefore = Math.floor(Date.now() / 1000) + validitySeconds;

    // Parse amounts
    const value = ethers.parseUnits(paymentAmount, 6); // USDC has 6 decimals
    const fee = ethers.parseUnits(facilitatorFee, 6);

    // Calculate commitment (nonce)
    const nonce = await this.contractReader.calculateCommitment(
      service.settlementRouter,
      {
        token: service.usdcAddress,
        from: payerAddress,
        value,
        validAfter,
        validBefore,
        salt,
        payTo,
        facilitatorFee: fee,
        hook: service.hookAddress,
        hookData,
      }
    );

    // Get token info for EIP-712 domain
    const tokenInfo = await this.contractReader.getTokenInfo(service.usdcAddress);

    // Build EIP-712 typed data
    const typedData: EIP712TypedData = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        TransferWithAuthorization: [
          { name: 'from', type: 'address' },
          { name: 'to', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'validAfter', type: 'uint256' },
          { name: 'validBefore', type: 'uint256' },
          { name: 'nonce', type: 'bytes32' },
        ],
      },
      primaryType: 'TransferWithAuthorization',
      domain: {
        name: tokenInfo.name,
        version: tokenInfo.version,
        chainId: service.chainId,
        verifyingContract: service.usdcAddress,
      },
      message: {
        from: payerAddress,
        to: service.settlementRouter,
        value: value.toString(),
        validAfter: validAfter.toString(),
        validBefore: validBefore.toString(),
        nonce,
      },
    };

    return {
      typedData,
      routerAddress: service.settlementRouter,
      nonce,
      salt,
      hookData,
      params: {
        token: service.usdcAddress,
        from: payerAddress,
        value,
        validAfter,
        validBefore,
        payTo,
        facilitatorFee: fee,
        hook: service.hookAddress,
      },
    };
  }

  /**
   * Validate signature format
   */
  validateSignature(signature: string): boolean {
    // Check hex format
    if (!signature.startsWith('0x')) {
      return false;
    }
    // Check length (65 bytes = 130 hex chars + '0x' prefix = 132)
    if (signature.length !== 132) {
      return false;
    }
    // Check all characters are valid hex
    const hexPart = signature.slice(2);
    return /^[0-9a-fA-F]+$/.test(hexPart);
  }

  /**
   * Submit a signed transaction
   */
  async submitTransaction(
    prepared: PreparedTransaction,
    signature: string,
    signerPrivateKey: string
  ): Promise<TransactionResult> {
    // Validate signature format
    if (!this.validateSignature(signature)) {
      throw new SignatureError(
        'Invalid signature format',
        'Signature must be a 65-byte hex string starting with 0x'
      );
    }

    try {
      const provider = this.contractReader.getProvider();
      const signer = new ethers.Wallet(signerPrivateKey, provider);

      const router = new ethers.Contract(
        prepared.routerAddress,
        SETTLEMENT_ROUTER_ABI,
        signer
      );

      const tx = await router.settleAndExecute(
        prepared.params.token,
        prepared.params.from,
        prepared.params.value,
        prepared.params.validAfter,
        prepared.params.validBefore,
        prepared.nonce,
        signature,
        prepared.salt,
        prepared.params.payTo,
        prepared.params.facilitatorFee,
        prepared.params.hook,
        prepared.hookData
      );

      const receipt = await tx.wait();

      // Parse events
      const events: TransactionEvent[] = receipt.logs.map((log: ethers.Log) => {
        try {
          const parsed = router.interface.parseLog({
            topics: log.topics as string[],
            data: log.data,
          });
          if (parsed) {
            return {
              name: parsed.name,
              args: Object.fromEntries(
                parsed.fragment.inputs.map((input, i) => [
                  input.name,
                  parsed.args[i],
                ])
              ),
            };
          }
        } catch {
          // Ignore unparseable logs
        }
        return { name: 'Unknown', args: {} };
      });

      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        events,
      };
    } catch (error) {
      if (error instanceof Error) {
        // Check for revert reason
        const revertMatch = error.message.match(/reason="([^"]+)"/);
        const revertReason = revertMatch ? revertMatch[1] : undefined;

        throw new TransactionError(
          `Transaction failed: ${error.message}`,
          undefined,
          revertReason
        );
      }
      throw error;
    }
  }

  /**
   * Get the typed data for wallet signing (convenience method)
   */
  getTypedDataForSigning(prepared: PreparedTransaction): EIP712TypedData {
    return prepared.typedData;
  }

  /**
   * Encode hook data (convenience method)
   */
  encodeHookData(hookDataParams: HookDataParams): string {
    return HookDataCodec.encode(hookDataParams.type, hookDataParams);
  }

  /**
   * Get network settings
   */
  getNetworkSettings() {
    return { ...this.networkSettings };
  }
}

/**
 * Create a new X402 client instance
 */
export function createX402Client(config: X402ClientConfig): X402Client {
  return new X402Client(config);
}
