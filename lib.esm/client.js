import { getLogicDriver } from 'js-moi-sdk';
export const LOGIC_ID = process.env.MOI_AGENT_REGISTRY_LOGIC_ID
    ?? '0x2000000097efdc0a58e8a28f2968ea414d6b26efdbf7baee96c7ff8600000000';
export async function loadContract(signer) {
    return getLogicDriver(LOGIC_ID, signer);
}
//# sourceMappingURL=client.js.map