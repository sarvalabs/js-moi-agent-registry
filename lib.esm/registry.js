import { loadContract } from './client.js';
import { getIdentifier } from './utils.js';
import { AgentStatus, } from './types.js';
import { ContractLoadError, UploaderRequiredError, UploaderError, TransactionError, QueryError, } from './errors.js';
import { buildAgentCard, agentCardToJson } from './card.js';
export class AgentRegistry {
    wallet;
    driver;
    uploader;
    constructor(wallet, driver, uploader) {
        this.wallet = wallet;
        this.driver = driver;
        this.uploader = uploader;
    }
    /**
     * Initialises the registry client. Fetches the contract manifest from the
     * MOI network — no manifest or logic ID needed from the caller.
     *
     * @throws {ContractLoadError} If the contract manifest cannot be fetched from the network.
     */
    static async init(config) {
        let driver;
        try {
            driver = await loadContract(config.wallet);
        }
        catch (error) {
            throw new ContractLoadError(error);
        }
        return new AgentRegistry(config.wallet, driver, config.uploader);
    }
    // ── Write ────────────────────────────────────────────────────────────────
    /**
     * Builds the agent card, uploads it via `uploader`, and registers on-chain.
     * Single call — three internal steps: build → upload → register.
     *
     * @returns The assigned `agent_id`.
     * @throws {UploaderRequiredError} If no `uploader` was provided in config.
     * @throws {UploaderError} If the upload step fails.
     * @throws {TransactionError} If the on-chain transaction fails.
     */
    async createAgent(spec, info) {
        if (!this.uploader)
            throw new UploaderRequiredError();
        const { agentWallet, ...cardInput } = info;
        let cardUri;
        try {
            cardUri = await this.uploader(agentCardToJson(buildAgentCard(spec, cardInput)));
        }
        catch (error) {
            throw new UploaderError(error);
        }
        return this.registerAgent({ url: info.url, cardUri, agentWallet });
    }
    /**
     * Low-level registration for callers that already hold a `cardUri`.
     * Prefer `createAgent` for the full flow.
     *
     * @returns The assigned `agent_id`.
     * @throws {TransactionError} If the on-chain transaction fails.
     */
    async registerAgent(input) {
        const owner = await this.getCallerAddress();
        try {
            const response = await this.driver.routines.RegisterAgent(input.url, input.cardUri, input.agentWallet, owner).send();
            const receipt = await response.wait();
            let decoded = null;
            try {
                decoded = await response.result();
            }
            catch { }
            const agentId = decoded?.output?.agent_id ??
                decoded?.agent_id ??
                receipt.output?.agent_id;
            if (!agentId || typeof agentId !== 'string') {
                throw new TransactionError('RegisterAgent succeeded but returned no agent_id', receipt.ix_hash, receipt);
            }
            return agentId;
        }
        catch (error) {
            if (error instanceof TransactionError)
                throw error;
            throw new TransactionError('Failed to register agent', undefined, error);
        }
    }
    /**
     * Updates the agent's operating wallet address. Owner-only.
     *
     * @throws {TransactionError} If the on-chain transaction fails.
     */
    async updateAgentWallet(agentId, agentWallet) {
        const caller = await this.getCallerAddress();
        try {
            const response = await this.driver.routines.UpdateAgentWallet(agentId, agentWallet, caller).send();
            await response.wait();
        }
        catch (error) {
            throw new TransactionError(`Failed to update agent wallet for ${agentId}`, undefined, error);
        }
    }
    /**
     * Updates the service URL and card URI for an agent. Owner-only.
     *
     * @throws {TransactionError} If the on-chain transaction fails.
     */
    async updateCard(input) {
        const caller = await this.getCallerAddress();
        try {
            const response = await this.driver.routines.UpdateCard(input.agentId, input.url, input.cardUri, caller).send();
            await response.wait();
        }
        catch (error) {
            throw new TransactionError(`Failed to update card for agent ${input.agentId}`, undefined, error);
        }
    }
    /**
     * Sets the lifecycle status of an agent. Owner-only.
     *
     * @throws {TransactionError} If the on-chain transaction fails.
     */
    async setAgentStatus(agentId, status) {
        const caller = await this.getCallerAddress();
        try {
            const response = await this.driver.routines.SetAgentStatus(agentId, status, caller).send();
            await response.wait();
        }
        catch (error) {
            throw new TransactionError(`Failed to set status for agent ${agentId}`, undefined, error);
        }
    }
    /**
     * Sets the score payload for an agent. Owner-only.
     *
     * @throws {TransactionError} If the on-chain transaction fails.
     */
    async setScore(agentId, score) {
        const caller = await this.getCallerAddress();
        try {
            const response = await this.driver.routines.SetScore(agentId, score, caller).send();
            await response.wait();
        }
        catch (error) {
            throw new TransactionError(`Failed to set score for agent ${agentId}`, undefined, error);
        }
    }
    /**
     * Transfers ownership of an agent to a new wallet. Single atomic operation.
     *
     * @throws {TransactionError} If the on-chain transaction fails.
     */
    async transferAgent(agentId, newOwner) {
        const caller = await this.getCallerAddress();
        try {
            const response = await this.driver.routines.TransferAgent(agentId, newOwner, caller).send();
            await response.wait();
        }
        catch (error) {
            throw new TransactionError(`Failed to transfer agent ${agentId}`, undefined, error);
        }
    }
    // ── Read ─────────────────────────────────────────────────────────────────
    /**
     * Returns the full on-chain profile for an agent.
     * Returns `{ found: false, profile: null }` if the agent does not exist — does not throw.
     */
    async getAgentProfile(agentId) {
        try {
            const callResponse = await this.driver.routines.GetAgentProfile(agentId).call();
            const decoded = await callResponse.result();
            const output = decoded?.output ?? decoded;
            const found = Boolean(output?.found);
            if (!found)
                return { profile: null, found: false };
            return { profile: this.parseProfile(output?.profile), found: true };
        }
        catch (error) {
            if (String(error).includes('map key does not exist'))
                return { profile: null, found: false };
            throw new QueryError(`Failed to get agent profile: ${agentId}`, error);
        }
    }
    /**
     * Returns all agent IDs controlled by the given owner wallet.
     */
    async getAgentsByOwner(ownerAddress) {
        try {
            const callResponse = await this.driver.routines.GetAgentsByOwner(ownerAddress).call();
            const decoded = await callResponse.result();
            const output = decoded?.output ?? decoded;
            return output?.ids ?? [];
        }
        catch (error) {
            throw new QueryError(`Failed to get agents for owner: ${ownerAddress}`, error);
        }
    }
    /**
     * Returns all agent IDs controlled by the connected wallet.
     */
    async getMyAgents() {
        const address = await this.getCallerAddress();
        return this.getAgentsByOwner(address);
    }
    /**
     * Returns all registered agent IDs across the entire registry.
     */
    async getAllAgentIds() {
        try {
            const callResponse = await this.driver.routines.GetAllAgentIds().call();
            const decoded = await callResponse.result();
            const output = decoded?.output ?? decoded;
            return output?.ids ?? [];
        }
        catch (error) {
            throw new QueryError('Failed to get all agent IDs', error);
        }
    }
    /**
     * Returns the total number of registered agents.
     */
    async getAgentCount() {
        try {
            const callResponse = await this.driver.routines.GetAgentCount().call();
            const decoded = await callResponse.result();
            const output = decoded?.output ?? decoded;
            return BigInt(output?.count ?? 0);
        }
        catch (error) {
            throw new QueryError('Failed to get agent count', error);
        }
    }
    // ── Private ──────────────────────────────────────────────────────────────
    async getCallerAddress() {
        return getIdentifier(this.wallet);
    }
    parseProfile(raw) {
        return {
            agent_id: String(raw?.agent_id ?? ''),
            owner: String(raw?.owner ?? ''),
            agent_wallet: String(raw?.agent_wallet ?? ''),
            status: raw?.status ?? AgentStatus.ACTIVE,
            url: String(raw?.url ?? ''),
            card_uri: String(raw?.card_uri ?? ''),
            score: BigInt(raw?.score ?? 0),
            created_at: BigInt(raw?.created_at ?? 0),
            updated_at: BigInt(raw?.updated_at ?? 0),
        };
    }
}
//# sourceMappingURL=registry.js.map