export async function getIdentifier(wallet) {
    let identifier;
    if (wallet.getIdentifier) {
        identifier = await wallet.getIdentifier();
    }
    else if (wallet.getAddress) {
        identifier = await wallet.getAddress();
    }
    else {
        throw new Error('Cannot resolve wallet identifier');
    }
    if (!identifier) {
        throw new Error('Cannot resolve wallet identifier');
    }
    return identifier.toString ? identifier.toString() : String(identifier);
}
export function normalizeIdentifier(value) {
    const trimmed = value.trim();
    if (!trimmed)
        return '';
    if (trimmed.startsWith('0x'))
        return trimmed;
    if (/^[0-9a-fA-F]{64}$/.test(trimmed))
        return `0x${trimmed}`;
    return trimmed;
}
//# sourceMappingURL=utils.js.map