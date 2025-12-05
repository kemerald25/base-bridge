import bs58 from 'bs58';

/**
 * Convert Solana pubkey (base58) to bytes32 for Base contracts
 */
export function solanaPubkeyToBytes32(pubkey: string): `0x${string}` {
  try {
    // Decode base58 to bytes
    const bytes = bs58.decode(pubkey);
    
    // Pad or truncate to 32 bytes
    const bytes32 = new Uint8Array(32);
    if (bytes.length <= 32) {
      bytes32.set(bytes, 32 - bytes.length);
    } else {
      bytes32.set(bytes.slice(0, 32));
    }
    
    // Convert to hex string with 0x prefix
    return `0x${Array.from(bytes32)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')}` as `0x${string}`;
  } catch (error) {
    throw new Error(`Invalid Solana pubkey: ${pubkey}`);
  }
}

/**
 * Convert Base address (20 bytes) to bytes32 for Solana bridge
 */
export function baseAddressToBytes32(address: string): Uint8Array {
  // Remove 0x prefix
  const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
  
  // Ethereum addresses are 20 bytes (40 hex chars), we need 32 bytes
  // Pad with zeros at the beginning
  const padded = '0'.repeat(24) + cleanAddress;
  const bytes = Buffer.from(padded, 'hex');
  return new Uint8Array(bytes);
}

/**
 * Convert bytes32 to Solana pubkey (base58)
 */
export function bytes32ToSolanaPubkey(bytes32: string): string {
  // Remove 0x prefix
  const cleanBytes = bytes32.startsWith('0x') ? bytes32.slice(2) : bytes32;
  
  // Convert hex to bytes
  const bytes = Buffer.from(cleanBytes, 'hex');
  
  // Encode to base58
  return bs58.encode(bytes);
}

/**
 * Validate Solana pubkey format
 */
export function isValidSolanaPubkey(pubkey: string): boolean {
  try {
    const decoded = bs58.decode(pubkey);
    return decoded.length === 32;
  } catch {
    return false;
  }
}

/**
 * Validate Base/Ethereum address format
 */
export function isValidBaseAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

