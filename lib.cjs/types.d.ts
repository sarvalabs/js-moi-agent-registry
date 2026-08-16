import type { Signer } from 'js-moi-sdk';
import type { AgentCardInput } from './card.js';
export type CardUploader = (cardJson: string) => Promise<string>;
export interface SDKConfig {
    wallet: Signer;
    uploader?: CardUploader;
}
export declare enum AgentStatus {
    ACTIVE = "ACTIVE",
    PAUSED = "PAUSED",
    DEPRECATED = "DEPRECATED"
}
export interface AgentProfile {
    agent_id: string;
    owner: string;
    agent_wallet: string;
    status: AgentStatus;
    url: string;
    card_uri: string;
    score: bigint;
    created_at: bigint;
    updated_at: bigint;
}
export interface AgentInfo extends AgentCardInput {
    agentWallet: string;
}
export interface RegisterAgentInput {
    url: string;
    cardUri: string;
    agentWallet: string;
}
export interface UpdateCardInput {
    agentId: string;
    url: string;
    cardUri: string;
}
export interface GetAgentProfileOutput {
    profile: AgentProfile | null;
    found: boolean;
}
export interface AgentIdsResult {
    ids: string[];
    total: bigint;
}
/**
 * Fuel overrides for a write call. The registry's own storage cost is
 * self-funded (payer Logic), but the sender still pays the interaction's
 * fuel - and default fuel estimation can revert once the registry holds
 * enough on-chain state for simulation to exceed the SDK's default ceiling,
 * even though the same call succeeds fine with an explicit limit. Pass this
 * through if a write call fails fuel estimation with no fuel_limit set.
 */
export interface SendOptions {
    fuel_limit?: number;
    fuel_price?: number;
}
//# sourceMappingURL=types.d.ts.map