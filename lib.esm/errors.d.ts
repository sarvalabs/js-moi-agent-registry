/** Thrown by `AgentRegistry.init` when the contract manifest can't be fetched from the network. */
export declare class ContractLoadError extends Error {
    readonly cause?: unknown | undefined;
    constructor(cause?: unknown | undefined);
}
/** Thrown by `createAgent` when `SDKConfig` was built without an `uploader`. */
export declare class UploaderRequiredError extends Error {
    constructor();
}
/** Thrown by `createAgent` when the configured `uploader` throws or rejects. */
export declare class UploaderError extends Error {
    readonly cause?: unknown | undefined;
    constructor(cause?: unknown | undefined);
}
/** Thrown by any write method when the on-chain interaction fails, or succeeds with an unusable result. */
export declare class TransactionError extends Error {
    readonly transactionHash?: string | undefined;
    readonly cause?: unknown | undefined;
    constructor(message: string, transactionHash?: string | undefined, cause?: unknown | undefined);
}
/** Thrown by any read method when the underlying call fails. */
export declare class QueryError extends Error {
    readonly cause?: unknown | undefined;
    constructor(message: string, cause?: unknown | undefined);
}
//# sourceMappingURL=errors.d.ts.map