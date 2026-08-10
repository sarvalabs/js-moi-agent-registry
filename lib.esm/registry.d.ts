import { SDKConfig, AgentStatus, RegisterAgentInput, UpdateCardInput, AgentInfo, GetAgentProfileOutput } from './types.js';
import type { AgentProtocolSpec } from './card.js';
export declare class AgentRegistry {
    private readonly wallet;
    private readonly driver;
    private readonly uploader?;
    private constructor();
    /**
     * Initialises the registry client. Fetches the contract manifest from the
     * MOI network — no manifest or logic ID needed from the caller.
     *
     * @throws {ContractLoadError} If the contract manifest cannot be fetched from the network.
     */
    static init(config: SDKConfig): Promise<AgentRegistry>;
    /**
     * Builds the agent card, uploads it via `uploader`, and registers on-chain.
     * Single call — three internal steps: build → upload → register.
     *
     * @returns The assigned `agent_id`.
     * @throws {UploaderRequiredError} If no `uploader` was provided in config.
     * @throws {UploaderError} If the upload step fails.
     * @throws {TransactionError} If the on-chain transaction fails.
     */
    createAgent(spec: AgentProtocolSpec, info: AgentInfo): Promise<string>;
    /**
     * Low-level registration for callers that already hold a `cardUri`.
     * Prefer `createAgent` for the full flow.
     *
     * @returns The assigned `agent_id`.
     * @throws {TransactionError} If the on-chain transaction fails.
     */
    registerAgent(input: RegisterAgentInput): Promise<string>;
    /**
     * Updates the account id of the wallet the agent operates from. Owner-only,
     * enforced on-chain against the connected wallet's real signature — not a
     * parameter you pass. Rejected once the agent is DEPRECATED.
     *
     * @throws {TransactionError} If the on-chain transaction fails.
     */
    updateAgentWallet(agentId: string, agentWallet: string): Promise<void>;
    /**
     * Updates the service URL and card URI for an agent. Owner-only, enforced
     * on-chain against the connected wallet's real signature. Rejected once the
     * agent is DEPRECATED.
     *
     * @throws {TransactionError} If the on-chain transaction fails.
     */
    updateCard(input: UpdateCardInput): Promise<void>;
    /**
     * Sets the lifecycle status of an agent. Owner-only, enforced on-chain
     * against the connected wallet's real signature. DEPRECATED is terminal —
     * once set, no further status change is allowed.
     *
     * @throws {TransactionError} If the on-chain transaction fails.
     */
    setAgentStatus(agentId: string, status: AgentStatus): Promise<void>;
    /**
     * Sets the score payload for an agent. Admin-only (not owner-only) — the
     * connected wallet must be the registry's admin account id, enforced
     * on-chain. Calling this as a regular agent owner will fail.
     *
     * @throws {TransactionError} If the on-chain transaction fails.
     */
    setScore(agentId: string, score: bigint): Promise<void>;
    /**
     * Transfers ownership of an agent to a new wallet. Single atomic operation.
     * Owner-only, enforced on-chain against the connected wallet's real
     * signature.
     *
     * @throws {TransactionError} If the on-chain transaction fails.
     */
    transferAgent(agentId: string, newOwner: string): Promise<void>;
    /**
     * Returns the full on-chain profile for an agent.
     * Returns `{ found: false, profile: null }` if the agent does not exist — does not throw.
     */
    getAgentProfile(agentId: string): Promise<GetAgentProfileOutput>;
    /**
     * Calls GetAgentsByOwner(accountId, offset, limit) directly.
     */
    getAgentsByOwner(accountId: string, offset: number, limit: number): Promise<{
        ids: string[];
        total: bigint;
    }>;
    /**
     * Calls GetAgentsByOwner(connected wallet's account id, offset, limit).
     */
    getMyAgents(offset: number, limit: number): Promise<{
        ids: string[];
        total: bigint;
    }>;
    /**
     * Calls GetAllAgentIds(offset, limit) directly.
     */
    getAllAgentIds(offset: number, limit: number): Promise<{
        ids: string[];
        total: bigint;
    }>;
    /**
     * Returns the total number of registered agents.
     */
    getAgentCount(): Promise<bigint>;
    private getCallerAccountId;
    private parseProfile;
}
//# sourceMappingURL=registry.d.ts.map