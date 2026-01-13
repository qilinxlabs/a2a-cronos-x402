import { ethers } from 'ethers';
import { ContractNotFoundError, NetworkError } from '../errors/index.js';
import type { TokenInfo } from './types.js';

/**
 * ABI for reading settlement router from hook contracts
 */
const HOOK_ABI = [
  'function settlementRouter() view returns (address)',
];

/**
 * ABI for SettlementRouter contract
 */
const SETTLEMENT_ROUTER_ABI = [
  'function calculateCommitment(address token, address from, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 salt, address payTo, uint256 facilitatorFee, address hook, bytes calldata hookData) view returns (bytes32)',
  'function settleAndExecute(address token, address from, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, bytes calldata signature, bytes32 salt, address payTo, uint256 facilitatorFee, address hook, bytes calldata hookData) external',
];

/**
 * ABI for EIP-3009 token (USDC)
 */
const TOKEN_ABI = [
  'function name() view returns (string)',
  'function version() view returns (string)',
];

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
export class ContractReader {
  private provider: ethers.JsonRpcProvider;

  constructor(rpcUrl: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  /**
   * Read the settlement router address from a hook contract
   */
  async getSettlementRouter(hookAddress: string): Promise<string> {
    try {
      const hook = new ethers.Contract(hookAddress, HOOK_ABI, this.provider);
      const routerAddress = await hook.settlementRouter();
      return routerAddress;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('call revert') || error.message.includes('CALL_EXCEPTION')) {
          throw new ContractNotFoundError(hookAddress);
        }
        throw new NetworkError(`Failed to read settlement router: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Calculate commitment (nonce) for a transaction
   */
  async calculateCommitment(
    routerAddress: string,
    params: CommitmentParams
  ): Promise<string> {
    try {
      const router = new ethers.Contract(
        routerAddress,
        SETTLEMENT_ROUTER_ABI,
        this.provider
      );

      const commitment = await router.calculateCommitment(
        params.token,
        params.from,
        params.value,
        params.validAfter,
        params.validBefore,
        params.salt,
        params.payTo,
        params.facilitatorFee,
        params.hook,
        params.hookData
      );

      return commitment;
    } catch (error) {
      if (error instanceof Error) {
        throw new NetworkError(`Failed to calculate commitment: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get token info for EIP-712 domain
   */
  async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    try {
      const token = new ethers.Contract(tokenAddress, TOKEN_ABI, this.provider);
      const [name, version] = await Promise.all([
        token.name(),
        token.version(),
      ]);
      return { name, version };
    } catch (error) {
      if (error instanceof Error) {
        throw new NetworkError(`Failed to read token info: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Check if a contract exists at an address
   */
  async contractExists(address: string): Promise<boolean> {
    try {
      const code = await this.provider.getCode(address);
      return code !== '0x';
    } catch {
      return false;
    }
  }

  /**
   * Get the underlying provider
   */
  getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }
}

export { SETTLEMENT_ROUTER_ABI, HOOK_ABI, TOKEN_ABI };
