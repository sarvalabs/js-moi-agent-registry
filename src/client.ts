import { getLogicDriver, LogicDriver } from 'js-moi-sdk';
import type { Signer } from 'js-moi-sdk';

export const LOGIC_ID = process.env.MOI_AGENT_REGISTRY_LOGIC_ID
  ?? '0x20000000f5b0c7afaf23308993bd5af18f827aef75e6656208cc421d00000000';

export async function loadContract(signer: Signer): Promise<LogicDriver> {
  return getLogicDriver(LOGIC_ID, signer);
}
