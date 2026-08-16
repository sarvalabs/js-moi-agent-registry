"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryError = exports.TransactionError = exports.UploaderError = exports.UploaderRequiredError = exports.ContractLoadError = void 0;
function formatCause(cause) {
    return cause instanceof Error ? cause.message : String(cause);
}
/** Thrown by `AgentRegistry.init` when the contract manifest can't be fetched from the network. */
class ContractLoadError extends Error {
    cause;
    constructor(cause) {
        super(`Failed to load AgentRegistryLogic contract: ${formatCause(cause)}`);
        this.cause = cause;
        this.name = 'ContractLoadError';
    }
}
exports.ContractLoadError = ContractLoadError;
/** Thrown by `createAgent` when `SDKConfig` was built without an `uploader`. */
class UploaderRequiredError extends Error {
    constructor() {
        super('An uploader function is required to call createAgent. Pass uploader in SDKConfig.');
        this.name = 'UploaderRequiredError';
    }
}
exports.UploaderRequiredError = UploaderRequiredError;
/** Thrown by `createAgent` when the configured `uploader` throws or rejects. */
class UploaderError extends Error {
    cause;
    constructor(cause) {
        super(`Card upload failed: ${formatCause(cause)}`);
        this.cause = cause;
        this.name = 'UploaderError';
    }
}
exports.UploaderError = UploaderError;
/** Thrown by any write method when the on-chain interaction fails, or succeeds with an unusable result. */
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
/** Thrown by any read method when the underlying call fails. */
class QueryError extends Error {
    cause;
    constructor(message, cause) {
        super(message);
        this.cause = cause;
        this.name = 'QueryError';
    }
}
exports.QueryError = QueryError;
//# sourceMappingURL=errors.js.map