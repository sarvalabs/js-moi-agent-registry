import { getLogicDriver, LogicDriver } from 'js-moi-sdk';
import type { Signer } from 'js-moi-sdk';

export const LOGIC_ID = process.env.MOI_AGENT_REGISTRY_LOGIC_ID
  ?? '0x20000000b97ce717ae04c8b6169ea3b83c0e0edd3e8a36637ce8703c00000000';

export async function loadContract(signer: Signer): Promise<LogicDriver> {
  return getLogicDriver(LOGIC_ID, signer);
}
