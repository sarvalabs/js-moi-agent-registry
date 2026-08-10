"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOGIC_ID = void 0;
exports.loadContract = loadContract;
const js_moi_sdk_1 = require("js-moi-sdk");
exports.LOGIC_ID = process.env.MOI_AGENT_REGISTRY_LOGIC_ID
    ?? '0x20000000e6e12f52628fc12c9d483f776bad6a56eda4fa5be160598400000000';
async function loadContract(signer) {
    return (0, js_moi_sdk_1.getLogicDriver)(exports.LOGIC_ID, signer);
}
//# sourceMappingURL=client.js.map