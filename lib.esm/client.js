import { getLogicDriver } from 'js-moi-sdk';
export const LOGIC_ID = process.env.MOI_AGENT_REGISTRY_LOGIC_ID
    ?? '0x2000000009ce50ba4c32ef07f9fbf4dcc2eb238103a250da7b843ebd00000000';
export async function loadContract(signer) {
    return getLogicDriver(LOGIC_ID, signer);
}
//# sourceMappingURL=client.js.map