import type { Signer } from 'js-moi-sdk';

export async function getIdentifier(wallet: Signer): Promise<string> {
  let identifier: any;

  if ((wallet as any).getIdentifier) {
    identifier = await (wallet as any).getIdentifier();
  } else if ((wallet as any).getAddress) {
    identifier = await (wallet as any).getAddress();
  } else {
    throw new Error('Cannot resolve wallet identifier');
  }

  if (!identifier) {
    throw new Error('Cannot resolve wallet identifier');
  }

  return identifier.toString ? identifier.toString() : String(identifier);
}

export function normalizeIdentifier(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('0x')) return trimmed;
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) return `0x${trimmed}`;
  return trimmed;
}
