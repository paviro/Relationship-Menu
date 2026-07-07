import { MenuData } from '../types';

// Error types for encryption/decryption
export class MenuEncryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MenuEncryptionError';
  }
}

// URL-safe base64 encode/decode
export function urlSafeBase64Encode(data: Uint8Array): string {
  return btoa(String.fromCharCode(...data))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function urlSafeBase64Decode(str: string): Uint8Array<ArrayBuffer> {
  // Add padding
  const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const bin = atob(b64);
  return new Uint8Array([...bin].map(c => c.charCodeAt(0)));
}

// AES-GCM encryption
export async function encryptMenu(menu: MenuData): Promise<{ encryptedData: Uint8Array; key: Uint8Array; urlSafeKey: string; }> {
  try {
    const json = JSON.stringify(menu);
    const enc = new TextEncoder();
    const data = enc.encode(json);
    const key = crypto.getRandomValues(new Uint8Array(32)); // 256-bit key
    const cryptoKey = await crypto.subtle.importKey('raw', key, 'AES-GCM', false, ['encrypt']);
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, data);
    // Combine IV + encrypted data
    const encryptedBytes = new Uint8Array(iv.length + encrypted.byteLength);
    encryptedBytes.set(iv, 0);
    encryptedBytes.set(new Uint8Array(encrypted), iv.length);
    return {
      encryptedData: encryptedBytes,
      key,
      urlSafeKey: urlSafeBase64Encode(key)
    };
  } catch {
    throw new MenuEncryptionError('Encryption failed');
  }
}

// AES-GCM decryption
export async function decryptMenu(encryptedData: Uint8Array<ArrayBuffer>, key: Uint8Array<ArrayBuffer>): Promise<MenuData> {
  try {
    const iv = encryptedData.slice(0, 12);
    const data = encryptedData.slice(12);
    const cryptoKey = await crypto.subtle.importKey('raw', key, 'AES-GCM', false, ['decrypt']);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, data);
    const dec = new TextDecoder();
    const json = dec.decode(decrypted);
    return JSON.parse(json) as MenuData;
  } catch {
    throw new MenuEncryptionError('Decryption failed');
  }
}

// Decrypt using url-safe base64 key
export async function decryptMenuWithUrlSafeKey(encryptedData: Uint8Array<ArrayBuffer>, urlSafeKey: string): Promise<MenuData> {
  const key = urlSafeBase64Decode(urlSafeKey);
  return decryptMenu(encryptedData, key);
}

// Helper to convert base64 string to Uint8Array
export function base64ToUint8Array(b64: string): Uint8Array {
  const bin = atob(b64);
  return new Uint8Array([...bin].map(c => c.charCodeAt(0)));
}

// Helper to convert Uint8Array to base64 string
export function uint8ArrayToBase64(arr: Uint8Array): string {
  return btoa(String.fromCharCode(...arr));
} 