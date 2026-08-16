export async function getIdentifier(wallet) {
    const identifier = await wallet.getIdentifier();
    return identifier.toHex();
}
//# sourceMappingURL=utils.js.map