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
     * Updates the agent's operating wallet address. Owner-only.
     *
     * @throws {TransactionError} If the on-chain transaction fails.
     */
    updateAgentWallet(agentId: string, agentWallet: string): Promise<void>;
    /**
     * Updates the service URL and card URI for an agent. Owner-only.
     *
     * @throws {TransactionError} If the on-chain transaction fails.
     */
    updateCard(input: UpdateCardInput): Promise<void>;
    /**
     * Sets the lifecycle status of an agent. Owner-only.
     *
     * @throws {TransactionError} If the on-chain transaction fails.
     */
    setAgentStatus(agentId: string, status: AgentStatus): Promise<void>;
    /**
     * Sets the score payload for an agent. Owner-only.
     *
     * @throws {TransactionError} If the on-chain transaction fails.
     */
    setScore(agentId: string, score: bigint): Promise<void>;
    /**
     * Transfers ownership of an agent to a new wallet. Single atomic operation.
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
     * Returns all agent IDs controlled by the given owner wallet.
     */
    getAgentsByOwner(ownerAddress: string): Promise<string[]>;
    /**
     * Returns all agent IDs controlled by the connected wallet.
     */
    getMyAgents(): Promise<string[]>;
    /**
     * Returns all registered agent IDs across the entire registry.
     */
    getAllAgentIds(): Promise<string[]>;
    /**
     * Returns the total number of registered agents.
     */
    getAgentCount(): Promise<bigint>;
    private getCallerAddress;
    private parseProfile;
}
//# sourceMappingURL=registry.d.ts.map