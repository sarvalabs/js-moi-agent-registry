"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOGIC_ID = void 0;
exports.loadContract = loadContract;
const js_moi_sdk_1 = require("js-moi-sdk");
exports.LOGIC_ID = process.env.MOI_AGENT_REGISTRY_LOGIC_ID
    ?? '0x20000000b97ce717ae04c8b6169ea3b83c0e0edd3e8a36637ce8703c00000000';
async function loadContract(signer) {
    return (0, js_moi_sdk_1.getLogicDriver)(exports.LOGIC_ID, signer);
}
//# sourceMappingURL=client.js.map