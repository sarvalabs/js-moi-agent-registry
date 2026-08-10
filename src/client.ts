import { getLogicDriver, LogicDriver } from 'js-moi-sdk';
import type { Signer } from 'js-moi-sdk';

export const LOGIC_ID = process.env.MOI_AGENT_REGISTRY_LOGIC_ID
  ?? '0x20000000e6e12f52628fc12c9d483f776bad6a56eda4fa5be160598400000000';

export async function loadContract(signer: Signer): Promise<LogicDriver> {
  return getLogicDriver(LOGIC_ID, signer);
}
