import { createPublicClient, http, parseEther, encodeFunctionData, Address, parseUnits } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { getBaseAddresses } from '../contracts/addresses';
import { solanaPubkeyToBytes32 } from './utils';

// Bridge ABI (simplified - you'll need the full ABI from the bridge repo)
const BRIDGE_ABI = [
  {
    name: 'bridgeToken',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: 'transfer',
        type: 'tuple',
        components: [
          { name: 'localToken', type: 'address' },
          { name: 'remoteToken', type: 'bytes32' },
          { name: 'to', type: 'bytes32' },
          { name: 'remoteAmount', type: 'uint256' },
        ],
      },
      {
        name: 'calls',
        type: 'tuple[]',
        components: [
          { name: 'target', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'data', type: 'bytes' },
        ],
      },
    ],
    outputs: [],
  },
  {
    name: 'sendMessage',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: 'message',
        type: 'tuple',
        components: [
          { name: 'nonce', type: 'uint256' },
          { name: 'sender', type: 'address' },
          { name: 'target', type: 'bytes32' },
          { name: 'value', type: 'uint256' },
          { name: 'data', type: 'bytes' },
        ],
      },
    ],
    outputs: [],
  },
] as const;

export interface BridgeTokenParams {
  localToken: Address; // Token address on Base
  remoteToken: string; // Token address on Solana (as bytes32)
  to: string; // Recipient address on Solana (as bytes32)
  remoteAmount: bigint; // Amount to bridge
}

export function createBaseClient() {
  const chainId = process.env.NEXT_PUBLIC_BASE_CHAIN_ID;
  const chain = chainId === '8453' ? base : baseSepolia;
  const rpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL || chain.rpcUrls.default.http[0];

  return createPublicClient({
    chain,
    transport: http(rpcUrl),
  });
}

export function encodeBridgeToken(params: BridgeTokenParams) {
  const addresses = getBaseAddresses();
  
  return encodeFunctionData({
    abi: BRIDGE_ABI,
    functionName: 'bridgeToken',
    args: [
      {
        localToken: params.localToken,
        remoteToken: params.remoteToken as `0x${string}`,
        to: params.to as `0x${string}`,
        remoteAmount: params.remoteAmount,
      },
      [], // No additional calls
    ],
  });
}

/**
 * Prepare bridge token parameters for Base → Solana
 */
export function prepareBridgeToSolana(params: {
  tokenAddress: Address;
  solanaRecipient: string;
  amount: string;
  decimals: number;
}): BridgeTokenParams {
  const remoteToken = solanaPubkeyToBytes32(
    params.tokenAddress === getBaseAddresses().SOL 
      ? 'So11111111111111111111111111111111111111112' // SOL mint on Solana
      : params.tokenAddress // For wrapped tokens, use the same address
  );
  
  const to = solanaPubkeyToBytes32(params.solanaRecipient);
  const remoteAmount = parseUnits(params.amount, params.decimals);

  return {
    localToken: params.tokenAddress,
    remoteToken,
    to,
    remoteAmount,
  };
}

/**
 * Convert amount string to bigint with decimals
 */
export function parseTokenAmount(amount: string, decimals: number): bigint {
  return parseUnits(amount, decimals);
}

