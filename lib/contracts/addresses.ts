// Base Mainnet Contract Addresses
export const BASE_MAINNET = {
  BRIDGE: '0x3eff766C76a1be2Ce1aCF2B69c78bCae257D5188',
  BRIDGE_VALIDATOR: '0xAF24c1c24Ff3BF1e6D882518120fC25442d6794B',
  CROSS_CHAIN_ERC20_FACTORY: '0xDD56781d0509650f8C2981231B6C917f2d5d7dF2',
  SOL: '0x311935Cd80B76769bF2ecC9D8Ab7635b2139cf82',
} as const;

// Base Sepolia Testnet Contract Addresses
export const BASE_SEPOLIA = {
  BRIDGE: '0x01824a90d32A69022DdAEcC6C5C14Ed08dB4EB9B',
  BRIDGE_VALIDATOR: '0xa80C07DF38fB1A5b3E6a4f4FAAB71E7a056a4EC7',
  CROSS_CHAIN_ERC20_FACTORY: '0x488EB7F7cb2568e31595D48cb26F63963Cc7565D',
  SOL: '0xCace0c896714DaF7098FFD8CC54aFCFe0338b4BC',
} as const;

// Solana Mainnet Program Addresses
export const SOLANA_MAINNET = {
  BRIDGE_PROGRAM: 'HNCne2FkVaNghhjKXapxJzPaBvAKDG1Ge3gqhZyfVWLM',
  RELAYER_PROGRAM: 'g1et5VenhfJHJwsdJsDbxWZuotD5H4iELNG61kS4fb9',
} as const;

// Solana Devnet Program Addresses
export const SOLANA_DEVNET = {
  BRIDGE_PROGRAM: '7c6mteAcTXaQ1MFBCrnuzoZVTTAEfZwa6wgy4bqX3KXC',
  RELAYER_PROGRAM: '56MBBEYAtQAdjT4e1NzHD8XaoyRSTvfgbSVVcEcHj51H',
  GAS_FEE_RECEIVER: 'AFs1LCbodhvwpgX3u3URLsud6R1XMSaMiQ5LtXw4GKYT',
} as const;

// Get addresses based on environment
export function getBaseAddresses() {
  const chainId = process.env.NEXT_PUBLIC_BASE_CHAIN_ID;
  // Support both string and number comparison
  const isMainnet = chainId === '8453' || chainId === 8453;
  return isMainnet ? BASE_MAINNET : BASE_SEPOLIA;
}

export function getSolanaAddresses() {
  const isMainnet = process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet-beta';
  return isMainnet ? SOLANA_MAINNET : SOLANA_DEVNET;
}

