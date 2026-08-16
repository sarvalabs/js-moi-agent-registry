import { LogicDriver } from 'js-moi-sdk';
import type { Signer } from 'js-moi-sdk';
export declare const LOGIC_ID: string;
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
};
export declare function loadContract(signer: Signer): Promise<LogicDriver<AgentRegistryRoutines>>;
//# sourceMappingURL=client.d.ts.map