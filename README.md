# a2a-cronos-x402

TypeScript SDK for x402 protocol contract interactions on Cronos networks.

## Overview

This library provides an implementation of the x402 protocol for contract-based services on Cronos. It enables:

- **Server developers** to register x402 service contracts (NFT Mint, Reward Points, Transfer/Split)
- **Client applications** to discover services and execute transactions via EIP-712 signed authorizations

## Acknowledgement

This project is inspired by [Official Cronos Labs A2A example](https://github.com/cronos-labs/x402-examples/tree/main/a2a).

## Features

- 🔐 EIP-712 typed data signing for secure transactions
- 🔍 Service discovery via `.well-known/agent.json`
- 📦 Three hook types: NFT Mint, Reward Points, Transfer/Split
- ⛓️ Cronos mainnet and testnet support
- 🛡️ Comprehensive error handling

## Installation

```bash
pnpm add @qilinxlabs/a2a-cronos-x402
# or
npm install @qilinxlabs/a2a-cronos-x402
```

## Quick Start

### Server Setup

```typescript
import express from 'express';
import { createX402Server, type X402ServiceConfig } from '@qilinxlabs/a2a-cronos-x402';

const server = createX402Server({
  name: 'My X402 Services',
  description: 'x402 protocol services on Cronos',
  url: 'http://localhost:8787',
  network: 'cronos-testnet',
});

// Register NFT Mint service
await server.addService({
  id: 'nft-mint',
  title: 'NFT Mint Service',
  description: 'Mint a random NFT by paying with USDC',
  hookType: 'nft-mint',
  hookAddress: '0xf2A8921EEAda2734FeAbB9EC1d73fC5771B4Ec5B',
  network: 'cronos-testnet',
  supportingContracts: {
    nftContract: '0xA8633f571c51ad0EA7b3c51EC930Ee51fF8F0551',
  },
  defaults: {
    paymentAmount: '0.1',
    facilitatorFee: '0',
    payTo: '0xYourMerchantAddress',
  },
});

// Register Reward Points service
await server.addService({
  id: 'reward-points',
  title: 'Reward Points Service',
  description: 'Earn reward points by making a payment',
  hookType: 'reward-points',
  hookAddress: '0xaF49Bd5164D530aC5127d364F6ce4e079741950b',
  network: 'cronos-testnet',
  supportingContracts: {
    rewardToken: '0xF7A17B7EA6EBB661A88B45035D58f0699C7b9d31',
  },
  defaults: {
    paymentAmount: '0.1',
    facilitatorFee: '0',
    payTo: '0xYourMerchantAddress',
  },
});

// Register Transfer/Split service
await server.addService({
  id: 'transfer-split',
  title: 'Transfer/Split Payment Service',
  description: 'Transfer or split payments between multiple recipients',
  hookType: 'transfer-split',
  hookAddress: '0xC94ebf218bb67d6FF5599B5a6457Ad5E70E0db8D',
  network: 'cronos-testnet',
  defaults: {
    paymentAmount: '0.1',
    facilitatorFee: '0',
    payTo: '0xYourMerchantAddress',
  },
});

// Mount Express middleware
const app = express();
app.use(express.json());
const router = express.Router();
server.expressMiddleware(router);
app.use(router);
app.listen(8787);
```

### Client Usage

```typescript
import { createX402Client } from '@qilinxlabs/a2a-cronos-x402';
import { ethers } from 'ethers';

const client = createX402Client({
  network: 'cronos-testnet',
});

// Discover services from server
const discovered = await client.discover('http://localhost:8787');
console.log('Services:', discovered.services);

// Select a service
const service = discovered.services.find(s => s.hookType === 'nft-mint');

// Prepare transaction
const prepared = await client.prepareTransaction({
  service,
  payerAddress: '0xPayerAddress',
  payTo: '0xMerchantAddress',
  paymentAmount: '0.1',
  hookDataParams: {
    type: 'nft-mint',
    nftContract: '0xA8633f571c51ad0EA7b3c51EC930Ee51fF8F0551',
  },
});

// Sign with ethers wallet
const wallet = new ethers.Wallet(privateKey);
const { domain, types, message } = prepared.typedData;
const signature = await wallet.signTypedData(
  { name: domain.name, version: domain.version, chainId: domain.chainId, verifyingContract: domain.verifyingContract },
  { TransferWithAuthorization: types.TransferWithAuthorization },
  message
);

// Submit transaction
const result = await client.submitTransaction(prepared, signature, facilitatorPrivateKey);
console.log('Transaction hash:', result.txHash);
```

## Hook Types

| Hook Type | Description | hookData Format |
|-----------|-------------|-----------------|
| `nft-mint` | Mint NFT after payment | `tuple(address nftContract)` |
| `reward-points` | Distribute loyalty points | `tuple(address rewardToken)` |
| `transfer-split` | Split payment between recipients | `tuple(address recipient, uint16 bips)[]` |

### Transfer/Split Hook Data

For simple transfers, use empty hookData (`0x`). For split payments:

```typescript
// Split 50/50 between two recipients
const hookData = client.encodeHookData({
  type: 'transfer-split',
  splits: [
    { recipient: '0xRecipient1', bips: 5000 }, // 50%
    { recipient: '0xRecipient2', bips: 5000 }, // 50%
  ],
});
```

Note: `bips` (basis points) must sum to 10000 (100%).


## API Reference

### X402Server

```typescript
import { createX402Server, X402Server } from '@qilinxlabs/a2a-cronos-x402';

interface X402ServerConfig {
  name: string;
  description?: string;
  url: string;
  network: 'cronos' | 'cronos-testnet';
  rpcUrl?: string;
}

// Methods
server.addService(config: X402ServiceConfig): Promise<void>
server.getService(id: string): X402Service | undefined
server.listServices(): X402Service[]
server.getAgentCard(): AgentCard
server.expressMiddleware(router: Router): Router
```

### X402Client

```typescript
import { createX402Client, X402Client } from '@qilinxlabs/a2a-cronos-x402';

interface X402ClientConfig {
  network: 'cronos' | 'cronos-testnet';
  rpcUrl?: string;
}

// Methods
client.discover(serverUrl: string): Promise<DiscoveredServices>
client.discoverAll(serverUrls: string[]): Promise<DiscoveredServices[]>
client.prepareTransaction(params: TransactionParams): Promise<PreparedTransaction>
client.submitTransaction(prepared, signature, signerPrivateKey): Promise<TransactionResult>
client.validateSignature(signature: string): boolean
client.encodeHookData(params: HookDataParams): string
```

## Server Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /.well-known/agent.json` | Agent card with all services |
| `GET /api/x402/services` | List all registered services |
| `GET /api/x402/services/:id` | Get service details with hookData schema |

## Deployed Contracts (Cronos Testnet)

```typescript
const TESTNET_CONTRACTS = {
  // Infrastructure
  settlementRouter: '0x80e941858065dfD4875030A7a30DfbfeE8c7742a',
  devUSDC: '0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0',
  
  // NFT Mint Hook
  nftMintHook: '0xf2A8921EEAda2734FeAbB9EC1d73fC5771B4Ec5B',
  randomNFT: '0xA8633f571c51ad0EA7b3c51EC930Ee51fF8F0551',
  
  // Reward Points Hook
  rewardHook: '0xaF49Bd5164D530aC5127d364F6ce4e079741950b',
  rewardToken: '0xF7A17B7EA6EBB661A88B45035D58f0699C7b9d31',
  
  // Transfer/Split Hook
  transferHook: '0xC94ebf218bb67d6FF5599B5a6457Ad5E70E0db8D',
};
```


## Error Handling

```typescript
import {
  X402Error,
  ContractNotFoundError,
  SignatureError,
  TransactionError,
  NetworkError,
  ConfigurationError,
} from '@qilinxlabs/a2a-cronos-x402';

try {
  await server.addService(config);
} catch (error) {
  if (error instanceof ContractNotFoundError) {
    console.log('Hook contract not found:', error.address);
  } else if (error instanceof ConfigurationError) {
    console.log('Missing fields:', error.missingFields);
  } else if (error instanceof TransactionError) {
    console.log('Transaction failed:', error.revertReason);
  }
}
```

## Network Configuration

The library automatically configures RPC URLs and contract addresses for each network:

| Network | Chain ID | USDC Address |
|---------|----------|--------------|
| `cronos` | 25 | `0xc21223249CA28397B4B6541dfFaEcC539BfF0c59` |
| `cronos-testnet` | 338 | `0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0` |

You can override the RPC URL:

```typescript
const server = createX402Server({
  network: 'cronos-testnet',
  rpcUrl: 'https://your-custom-rpc.com',
});
```

## License

MIT
