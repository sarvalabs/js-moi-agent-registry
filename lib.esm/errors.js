export class ContractLoadError extends Error {
    cause;
    constructor(cause) {
        super(`Failed to load AgentRegistryLogic contract: ${cause instanceof Error ? cause.message : String(cause)}`);
        this.cause = cause;
        this.name = 'ContractLoadError';
    }
}
export class SignerRequiredError extends Error {
    operation;
    constructor(operation) {
        super(`A private key is required to call ${operation}. Pass privateKey in SDKConfig.`);
        this.operation = operation;
        this.name = 'SignerRequiredError';
    }
}
export class UploaderRequiredError extends Error {
    constructor() {
        super('An uploader function is required to call createAgent. Pass uploader in SDKConfig.');
        this.name = 'UploaderRequiredError';
    }
}
export class UploaderError extends Error {
    cause;
    constructor(cause) {
        super(`Card upload failed: ${cause instanceof Error ? cause.message : String(cause)}`);
        this.cause = cause;
        this.name = 'UploaderError';
    }
}
export class TransactionError extends Error {
    transactionHash;
    cause;
    constructor(message, transactionHash, cause) {
        super(message);
        this.transactionHash = transactionHash;
        this.cause = cause;
        this.name = 'TransactionError';
    }
}
export class QueryError extends Error {
    cause;
    constructor(message, cause) {
        super(message);
        this.cause = cause;
        this.name = 'QueryError';
    }
}
export class AgentNotFoundError extends Error {
    agentId;
    constructor(agentId) {
        super(`Agent not found: ${agentId}`);
        this.agentId = agentId;
        this.name = 'AgentNotFoundError';
    }
}
//# sourceMappingURL=errors.js.map