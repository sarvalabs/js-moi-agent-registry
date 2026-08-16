import type { Signer } from 'js-moi-sdk';

export async function getIdentifier(wallet: Signer): Promise<string> {
  const identifier = await wallet.getIdentifier();
  return identifier.toHex();
}
