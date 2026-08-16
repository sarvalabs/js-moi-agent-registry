"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIdentifier = getIdentifier;
async function getIdentifier(wallet) {
    const identifier = await wallet.getIdentifier();
    return identifier.toHex();
}
//# sourceMappingURL=utils.js.map