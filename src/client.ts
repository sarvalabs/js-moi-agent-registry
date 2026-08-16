import { getLogicDriver, LogicDriver } from 'js-moi-sdk';
import type { Signer } from 'js-moi-sdk';

export const LOGIC_ID = process.env.MOI_AGENT_REGISTRY_LOGIC_ID
  ?? '0x20000000c684f926ed158d0cbfe66af0e482a389393e7899a5a73fcb00000000';

/**
 * Routine signatures for AgentRegistryLogic, matching AgentRegistryLogic.coco.
 * Typing `LogicDriver` against this gives `driver.routines.X(...)` calls
 * real argument checking instead of falling back to `any`.
 */
export type AgentRegistryRoutines = {
  RegisterAgent(url: string, cardUri: string, agentWallet: string): any;
  UpdateAgentWallet(agentId: string, agentWallet: string): any;
  UpdateCard(agentId: string, url: string, cardUri: string): any;
  SetAgentStatus(agentId: string, status: string): any;
  SetScore(agentId: string, score: bigint): any;
  TransferAgent(agentId: string, newOwner: string): any;
  GetAgentProfile(agentId: string): any;
  GetAgentsByOwner(owner: string, offset: number, limit: number): any;
  GetAllAgentIds(offset: number, limit: number): any;
  GetAgentCount(): any;
}

export async function loadContract(signer: Signer): Promise<LogicDriver<AgentRegistryRoutines>> {
  return getLogicDriver<AgentRegistryRoutines>(LOGIC_ID, signer);
}
