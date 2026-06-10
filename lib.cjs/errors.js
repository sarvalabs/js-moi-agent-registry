"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentNotFoundError = exports.QueryError = exports.TransactionError = exports.UploaderError = exports.UploaderRequiredError = exports.SignerRequiredError = exports.ContractLoadError = void 0;
class ContractLoadError extends Error {
    cause;
    constructor(cause) {
        super(`Failed to load AgentRegistryLogic contract: ${cause instanceof Error ? cause.message : String(cause)}`);
        this.cause = cause;
        this.name = 'ContractLoadError';
    }
}
exports.ContractLoadError = ContractLoadError;
class SignerRequiredError extends Error {
    operation;
    constructor(operation) {
        super(`A private key is required to call ${operation}. Pass privateKey in SDKConfig.`);
        this.operation = operation;
        this.name = 'SignerRequiredError';
    }
}
exports.SignerRequiredError = SignerRequiredError;
class UploaderRequiredError extends Error {
    constructor() {
        super('An uploader function is required to call createAgent. Pass uploader in SDKConfig.');
        this.name = 'UploaderRequiredError';
    }
}
exports.UploaderRequiredError = UploaderRequiredError;
class UploaderError extends Error {
    cause;
    constructor(cause) {
        super(`Card upload failed: ${cause instanceof Error ? cause.message : String(cause)}`);
        this.cause = cause;
        this.name = 'UploaderError';
    }
}
exports.UploaderError = UploaderError;
class TransactionError extends Error {
    transactionHash;
    cause;
    constructor(message, transactionHash, cause) {
        super(message);
        this.transactionHash = transactionHash;
        this.cause = cause;
        this.name = 'TransactionError';
    }
}
exports.TransactionError = TransactionError;
class QueryError extends Error {
    cause;
    constructor(message, cause) {
        super(message);
        this.cause = cause;
        this.name = 'QueryError';
    }
}
exports.QueryError = QueryError;
class AgentNotFoundError extends Error {
    agentId;
    constructor(agentId) {
        super(`Agent not found: ${agentId}`);
        this.agentId = agentId;
        this.name = 'AgentNotFoundError';
    }
}
exports.AgentNotFoundError = AgentNotFoundError;
//# sourceMappingURL=errors.js.map