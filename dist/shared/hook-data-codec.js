import { ethers } from 'ethers';
/**
 * Codec for encoding and decoding hookData for different hook types
 */
export class HookDataCodec {
    static abiCoder = new ethers.AbiCoder();
    /**
     * Encode hook data parameters to ABI-encoded bytes
     */
    static encode(hookType, params) {
        switch (hookType) {
            case 'nft-mint': {
                const data = params;
                return this.abiCoder.encode(['tuple(address)'], [[data.nftContract]]);
            }
            case 'reward-points': {
                const data = params;
                return this.abiCoder.encode(['tuple(address)'], [[data.rewardToken]]);
            }
            case 'transfer-split': {
                const data = params;
                if (!data.splits || data.splits.length === 0) {
                    return '0x';
                }
                const splits = data.splits.map((s) => ({
                    recipient: s.recipient,
                    bips: s.bips,
                }));
                return this.abiCoder.encode(['tuple(address recipient, uint16 bips)[]'], [splits]);
            }
            default:
                throw new Error(`Unknown hook type: ${hookType}`);
        }
    }
    /**
     * Decode ABI-encoded hookData back to parameters
     */
    static decode(hookType, hookData) {
        switch (hookType) {
            case 'nft-mint': {
                if (hookData === '0x' || hookData === '') {
                    throw new Error('NFT mint hookData cannot be empty');
                }
                const decoded = this.abiCoder.decode(['tuple(address)'], hookData);
                return {
                    type: 'nft-mint',
                    nftContract: decoded[0][0],
                };
            }
            case 'reward-points': {
                if (hookData === '0x' || hookData === '') {
                    throw new Error('Reward points hookData cannot be empty');
                }
                const decoded = this.abiCoder.decode(['tuple(address)'], hookData);
                return {
                    type: 'reward-points',
                    rewardToken: decoded[0][0],
                };
            }
            case 'transfer-split': {
                if (hookData === '0x' || hookData === '') {
                    return {
                        type: 'transfer-split',
                        splits: undefined,
                    };
                }
                const decoded = this.abiCoder.decode(['tuple(address recipient, uint16 bips)[]'], hookData);
                const splits = decoded[0].map((s) => ({
                    recipient: s.recipient,
                    bips: Number(s.bips),
                }));
                return {
                    type: 'transfer-split',
                    splits,
                };
            }
            default:
                throw new Error(`Unknown hook type: ${hookType}`);
        }
    }
    /**
     * Get the encoding schema for a hook type
     */
    static getSchema(hookType) {
        switch (hookType) {
            case 'nft-mint':
                return {
                    hookType: 'nft-mint',
                    abiType: 'tuple(address)',
                    description: 'NFT contract address to mint from',
                    example: '{ "nftContract": "0x..." }',
                };
            case 'reward-points':
                return {
                    hookType: 'reward-points',
                    abiType: 'tuple(address)',
                    description: 'Reward token contract address',
                    example: '{ "rewardToken": "0x..." }',
                };
            case 'transfer-split':
                return {
                    hookType: 'transfer-split',
                    abiType: 'tuple(address recipient, uint16 bips)[]',
                    description: 'Array of split recipients with basis points (10000 = 100%). Empty for simple transfer.',
                    example: '{ "splits": [{ "recipient": "0x...", "bips": 5000 }, { "recipient": "0x...", "bips": 5000 }] }',
                };
            default:
                throw new Error(`Unknown hook type: ${hookType}`);
        }
    }
    /**
     * Validate hook data parameters
     */
    static validate(params) {
        switch (params.type) {
            case 'nft-mint':
                return ethers.isAddress(params.nftContract);
            case 'reward-points':
                return ethers.isAddress(params.rewardToken);
            case 'transfer-split':
                if (!params.splits || params.splits.length === 0) {
                    return true; // Empty splits is valid
                }
                // Check all recipients are valid addresses and bips sum to 10000
                const allValidAddresses = params.splits.every((s) => ethers.isAddress(s.recipient));
                const totalBips = params.splits.reduce((sum, s) => sum + s.bips, 0);
                return allValidAddresses && totalBips === 10000;
            default:
                return false;
        }
    }
}
//# sourceMappingURL=hook-data-codec.js.map