import { getLogicDriver } from 'js-moi-sdk';
export const LOGIC_ID = process.env.MOI_AGENT_REGISTRY_LOGIC_ID
    ?? '0x2000000046691cc8a8dd21a9cbac0180de1f9bd09285326c6dbbc3e600000000';
export async function loadContract(signer) {
    return getLogicDriver(LOGIC_ID, signer);
}
//# sourceMappingURL=client.js.map