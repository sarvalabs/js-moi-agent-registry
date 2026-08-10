import { loadContract } from './client.js';
import { getIdentifier } from './utils.js';
import { AgentStatus, } from './types.js';
import { ContractLoadError, UploaderRequiredError, UploaderError, TransactionError, QueryError, } from './errors.js';
import { buildAgentCard, agentCardToJson } from './card.js';
import { Identifier } from 'js-moi-sdk';
// The manifest decoder returns Identifier-typed fields (owner, agent_wallet)
// as raw Uint8Array — confirmed directly against a live call.
// String(uint8Array) silently produces a garbage comma-joined number list
// ("0,0,0,171,...") instead of a usable account id, which then breaks any call
// that feeds it back in (e.g. getAgentsByOwner(profile.owner)). js-moi-sdk
// already has the right type for this — wrap it in Identifier and use its
// own .toHex(), rather than hand-rolling byte-to-hex conversion.
function identifierToHex(raw) {
    if (raw instanceof Uint8Array)
        return new Identifier(raw).toHex();
    return String(raw ?? '');
}
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
        try {
            const response = await this.driver.routines.RegisterAgent(input.url, input.cardUri, input.agentWallet).send();
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
     * Updates the account id of the wallet the agent operates from. Owner-only,
     * enforced on-chain against the connected wallet's real signature — not a
     * parameter you pass. Rejected once the agent is DEPRECATED.
     *
     * @throws {TransactionError} If the on-chain transaction fails.
     */
    async updateAgentWallet(agentId, agentWallet) {
        try {
            const response = await this.driver.routines.UpdateAgentWallet(agentId, agentWallet).send();
            await response.wait();
        }
        catch (error) {
            throw new TransactionError(`Failed to update agent wallet for ${agentId}`, undefined, error);
        }
    }
    /**
     * Updates the service URL and card URI for an agent. Owner-only, enforced
     * on-chain against the connected wallet's real signature. Rejected once the
     * agent is DEPRECATED.
     *
     * @throws {TransactionError} If the on-chain transaction fails.
     */
    async updateCard(input) {
        try {
            const response = await this.driver.routines.UpdateCard(input.agentId, input.url, input.cardUri).send();
            await response.wait();
        }
        catch (error) {
            throw new TransactionError(`Failed to update card for agent ${input.agentId}`, undefined, error);
        }
    }
    /**
     * Sets the lifecycle status of an agent. Owner-only, enforced on-chain
     * against the connected wallet's real signature. DEPRECATED is terminal —
     * once set, no further status change is allowed.
     *
     * @throws {TransactionError} If the on-chain transaction fails.
     */
    async setAgentStatus(agentId, status) {
        try {
            const response = await this.driver.routines.SetAgentStatus(agentId, status).send();
            await response.wait();
        }
        catch (error) {
            throw new TransactionError(`Failed to set status for agent ${agentId}`, undefined, error);
        }
    }
    /**
     * Sets the score payload for an agent. Admin-only (not owner-only) — the
     * connected wallet must be the registry's admin account id, enforced
     * on-chain. Calling this as a regular agent owner will fail.
     *
     * @throws {TransactionError} If the on-chain transaction fails.
     */
    async setScore(agentId, score) {
        try {
            const response = await this.driver.routines.SetScore(agentId, score).send();
            await response.wait();
        }
        catch (error) {
            throw new TransactionError(`Failed to set score for agent ${agentId}`, undefined, error);
        }
    }
    /**
     * Transfers ownership of an agent to a new wallet. Single atomic operation.
     * Owner-only, enforced on-chain against the connected wallet's real
     * signature.
     *
     * @throws {TransactionError} If the on-chain transaction fails.
     */
    async transferAgent(agentId, newOwner) {
        try {
            const response = await this.driver.routines.TransferAgent(agentId, newOwner).send();
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
     * Calls GetAgentsByOwner(accountId, offset, limit) directly.
     */
    async getAgentsByOwner(accountId, offset, limit) {
        try {
            const callResponse = await this.driver.routines.GetAgentsByOwner(accountId, offset, limit).call();
            const decoded = await callResponse.result();
            const output = decoded?.output ?? decoded;
            return { ids: output?.ids ?? [], total: BigInt(output?.total ?? 0) };
        }
        catch (error) {
            throw new QueryError(`Failed to get agents for owner: ${accountId}`, error);
        }
    }
    /**
     * Calls GetAgentsByOwner(connected wallet's account id, offset, limit).
     */
    async getMyAgents(offset, limit) {
        const accountId = await this.getCallerAccountId();
        return this.getAgentsByOwner(accountId, offset, limit);
    }
    /**
     * Calls GetAllAgentIds(offset, limit) directly.
     */
    async getAllAgentIds(offset, limit) {
        try {
            const callResponse = await this.driver.routines.GetAllAgentIds(offset, limit).call();
            const decoded = await callResponse.result();
            const output = decoded?.output ?? decoded;
            return { ids: output?.ids ?? [], total: BigInt(output?.total ?? 0) };
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
    async getCallerAccountId() {
        return getIdentifier(this.wallet);
    }
    parseProfile(raw) {
        return {
            agent_id: String(raw?.agent_id ?? ''),
            owner: identifierToHex(raw?.owner),
            agent_wallet: identifierToHex(raw?.agent_wallet),
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