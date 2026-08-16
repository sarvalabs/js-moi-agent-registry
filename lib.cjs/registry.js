"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRegistry = void 0;
const js_moi_sdk_1 = require("js-moi-sdk");
const client_js_1 = require("./client.js");
const utils_js_1 = require("./utils.js");
const types_js_1 = require("./types.js");
const errors_js_1 = require("./errors.js");
const card_js_1 = require("./card.js");
// The manifest decoder returns Identifier-typed fields (owner, agent_wallet)
// as raw Uint8Array — confirmed directly against a live call.
// String(uint8Array) silently produces a garbage comma-joined number list
// ("0,0,0,171,...") instead of a usable account id, which then breaks any call
// that feeds it back in (e.g. getAgentsByOwner(profile.owner)). js-moi-sdk
// already has the right type for this — wrap it in Identifier and use its
// own .toHex(), rather than hand-rolling byte-to-hex conversion.
//
// Only Uint8Array (the real decoded shape) and an already-hex string pass
// through; anything else throws rather than silently stringifying into the
// same kind of garbage this function exists to avoid.
function identifierToHex(raw) {
    if (raw instanceof Uint8Array)
        return new js_moi_sdk_1.Identifier(raw).toHex();
    if (typeof raw === 'string')
        return raw;
    throw new TypeError(`Expected an Identifier-shaped value (Uint8Array or hex string), got ${typeof raw}`);
}
// A reverted receipt can still carry a plausible-looking (but stale/garbage)
// decoded result() payload - confirmed directly against a live node. Every
// write path must check status before trusting result() at all.
function assertReceiptOk(receipt, message) {
    if (receipt.status !== js_moi_sdk_1.ReceiptStatus.RECEIPT_Ok) {
        throw new errors_js_1.TransactionError(`${message} (receipt status: ${receipt.status})`, receipt.ix_hash, receipt);
    }
}
// The read-call equivalent of assertReceiptOk. A `.call()` that fails before
// the routine's own logic ever runs (e.g. an offset/limit argument that
// doesn't decode to the u64 the manifest declares) does NOT throw - it
// resolves with a non-Ok receipt and a null `output` - confirmed live: a
// negative offset returns receipt.status 1 with output: null, error:
// {class: 'builtin.CallFailure', ...}. Every read method must check this
// before trusting `output`, or a real failure silently reads as an empty
// result (`ids: []`, `total: 0n`) instead of surfacing as a QueryError.
function assertCallOk(receipt, message) {
    if (receipt.status !== js_moi_sdk_1.ReceiptStatus.RECEIPT_Ok) {
        throw new errors_js_1.QueryError(`${message} (receipt status: ${receipt.status})`, receipt);
    }
}
/**
 * Client for the AgentRegistryLogic contract on MOI. Construct via
 * `AgentRegistry.init(config)`, not the constructor directly.
 */
class AgentRegistry {
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
            driver = await (0, client_js_1.loadContract)(config.wallet);
        }
        catch (error) {
            throw new errors_js_1.ContractLoadError(error);
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
    async createAgent(spec, info, options) {
        if (!this.uploader)
            throw new errors_js_1.UploaderRequiredError();
        const { agentWallet, ...cardInput } = info;
        let cardUri;
        try {
            cardUri = await this.uploader((0, card_js_1.agentCardToJson)((0, card_js_1.buildAgentCard)(spec, cardInput)));
        }
        catch (error) {
            throw new errors_js_1.UploaderError(error);
        }
        return this.registerAgent({ url: info.url, cardUri, agentWallet }, options);
    }
    /**
     * Low-level registration for callers that already hold a `cardUri`.
     * Prefer `createAgent` for the full flow.
     *
     * @returns The assigned `agent_id`.
     * @throws {TransactionError} If the on-chain transaction fails, or succeeds
     * but its result can't be decoded into an `agent_id`.
     */
    async registerAgent(input, options) {
        const { response, receipt } = await this.sendAndVerify(this.driver.routines.RegisterAgent(input.url, input.cardUri, input.agentWallet), 'Failed to register agent', options);
        let agentId;
        try {
            agentId = (await response.result()).output?.agent_id;
        }
        catch (error) {
            throw new errors_js_1.TransactionError('RegisterAgent succeeded but its result could not be decoded', receipt.ix_hash, error);
        }
        if (typeof agentId !== 'string' || !agentId) {
            throw new errors_js_1.TransactionError('RegisterAgent succeeded but returned no agent_id', receipt.ix_hash);
        }
        return agentId;
    }
    /**
     * Updates the account id of the wallet the agent operates from. Owner-only,
     * enforced on-chain against the connected wallet's real signature — not a
     * parameter you pass. Rejected once the agent is DEPRECATED.
     *
     * @throws {TransactionError} If the on-chain transaction fails.
     */
    async updateAgentWallet(agentId, agentWallet, options) {
        await this.sendAndVerify(this.driver.routines.UpdateAgentWallet(agentId, agentWallet), `Failed to update agent wallet for ${agentId}`, options);
    }
    /**
     * Updates the service URL and card URI for an agent. Owner-only, enforced
     * on-chain against the connected wallet's real signature. Rejected once the
     * agent is DEPRECATED.
     *
     * @throws {TransactionError} If the on-chain transaction fails.
     */
    async updateCard(input, options) {
        await this.sendAndVerify(this.driver.routines.UpdateCard(input.agentId, input.url, input.cardUri), `Failed to update card for agent ${input.agentId}`, options);
    }
    /**
     * Sets the lifecycle status of an agent. Owner-only, enforced on-chain
     * against the connected wallet's real signature. DEPRECATED is terminal —
     * once set, no further status change is allowed.
     *
     * @throws {TransactionError} If the on-chain transaction fails.
     */
    async setAgentStatus(agentId, status, options) {
        await this.sendAndVerify(this.driver.routines.SetAgentStatus(agentId, status), `Failed to set status for agent ${agentId}`, options);
    }
    /**
     * Sets the score payload for an agent. Admin-only (not owner-only) — the
     * connected wallet must be the registry's admin account id, enforced
     * on-chain. Calling this as a regular agent owner will fail.
     *
     * @throws {TransactionError} If the on-chain transaction fails.
     */
    async setScore(agentId, score, options) {
        await this.sendAndVerify(this.driver.routines.SetScore(agentId, score), `Failed to set score for agent ${agentId}`, options);
    }
    /**
     * Transfers ownership of an agent to a new wallet. Single atomic operation.
     * Owner-only, enforced on-chain against the connected wallet's real
     * signature.
     *
     * @throws {TransactionError} If the on-chain transaction fails.
     */
    async transferAgent(agentId, newOwner, options) {
        await this.sendAndVerify(this.driver.routines.TransferAgent(agentId, newOwner), `Failed to transfer agent ${agentId}`, options);
    }
    // ── Read ─────────────────────────────────────────────────────────────────
    /**
     * Returns the full on-chain profile for an agent.
     * Returns `{ found: false, profile: null }` if the agent does not exist — does not throw.
     */
    async getAgentProfile(agentId) {
        try {
            const callResponse = await this.driver.routines.GetAgentProfile(agentId).call();
            assertCallOk(callResponse.receipt, `Failed to get agent profile: ${agentId}`);
            const { output } = await callResponse.result();
            if (!output?.found)
                return { profile: null, found: false };
            return { profile: this.parseProfile(output.profile), found: true };
        }
        catch (error) {
            if (error instanceof errors_js_1.QueryError)
                throw error;
            throw new errors_js_1.QueryError(`Failed to get agent profile: ${agentId}`, error);
        }
    }
    /**
     * Calls GetAgentsByOwner(accountId, offset, limit) directly.
     */
    async getAgentsByOwner(accountId, offset, limit) {
        try {
            const callResponse = await this.driver.routines.GetAgentsByOwner(accountId, offset, limit).call();
            assertCallOk(callResponse.receipt, `Failed to get agents for owner: ${accountId}`);
            const { output } = await callResponse.result();
            return { ids: output?.ids ?? [], total: BigInt(output?.total ?? 0) };
        }
        catch (error) {
            if (error instanceof errors_js_1.QueryError)
                throw error;
            throw new errors_js_1.QueryError(`Failed to get agents for owner: ${accountId}`, error);
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
            assertCallOk(callResponse.receipt, 'Failed to get all agent IDs');
            const { output } = await callResponse.result();
            return { ids: output?.ids ?? [], total: BigInt(output?.total ?? 0) };
        }
        catch (error) {
            if (error instanceof errors_js_1.QueryError)
                throw error;
            throw new errors_js_1.QueryError('Failed to get all agent IDs', error);
        }
    }
    /**
     * Returns the total number of registered agents.
     */
    async getAgentCount() {
        try {
            const callResponse = await this.driver.routines.GetAgentCount().call();
            assertCallOk(callResponse.receipt, 'Failed to get agent count');
            const { output } = await callResponse.result();
            return BigInt(output?.count ?? 0);
        }
        catch (error) {
            if (error instanceof errors_js_1.QueryError)
                throw error;
            throw new errors_js_1.QueryError('Failed to get agent count', error);
        }
    }
    // ── Private ──────────────────────────────────────────────────────────────
    /**
     * Shared send → wait → verify path for every write endpoint: sends the
     * already-built routine call, waits for the receipt, and throws
     * `TransactionError` unless it landed with `RECEIPT_Ok`. Centralises the
     * error-wrapping every write method needs so each one only has to state
     * its own routine call and error message.
     */
    async sendAndVerify(context, errorMessage, options) {
        try {
            const response = await context.send(options);
            const receipt = await response.wait();
            assertReceiptOk(receipt, errorMessage);
            return { response, receipt };
        }
        catch (error) {
            if (error instanceof errors_js_1.TransactionError)
                throw error;
            throw new errors_js_1.TransactionError(errorMessage, undefined, error);
        }
    }
    async getCallerAccountId() {
        return (0, utils_js_1.getIdentifier)(this.wallet);
    }
    // `raw` is a dynamically-decoded POLO map (js-moi-sdk types logic call
    // output as `any` for the same reason - its shape depends on the manifest,
    // not something fixed enough to type meaningfully at the decode boundary).
    parseProfile(raw) {
        return {
            agent_id: String(raw?.agent_id ?? ''),
            owner: identifierToHex(raw?.owner),
            agent_wallet: identifierToHex(raw?.agent_wallet),
            status: raw?.status ?? types_js_1.AgentStatus.ACTIVE,
            url: String(raw?.url ?? ''),
            card_uri: String(raw?.card_uri ?? ''),
            score: BigInt(raw?.score ?? 0),
            created_at: BigInt(raw?.created_at ?? 0),
            updated_at: BigInt(raw?.updated_at ?? 0),
        };
    }
}
exports.AgentRegistry = AgentRegistry;
//# sourceMappingURL=registry.js.map