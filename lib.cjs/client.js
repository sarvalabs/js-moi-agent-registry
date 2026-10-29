"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOGIC_ID = void 0;
exports.loadContract = loadContract;
const js_moi_sdk_1 = require("js-moi-sdk");
exports.LOGIC_ID = process.env.MOI_AGENT_REGISTRY_LOGIC_ID
    ?? '0x2000000097efdc0a58e8a28f2968ea414d6b26efdbf7baee96c7ff8600000000';
async function loadContract(signer) {
    return (0, js_moi_sdk_1.getLogicDriver)(exports.LOGIC_ID, signer);
}
//# sourceMappingURL=client.js.map