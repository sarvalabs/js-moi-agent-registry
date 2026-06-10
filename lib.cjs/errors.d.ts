export declare class ContractLoadError extends Error {
    readonly cause?: unknown | undefined;
    constructor(cause?: unknown | undefined);
}
export declare class SignerRequiredError extends Error {
    readonly operation: string;
    constructor(operation: string);
}
export declare class UploaderRequiredError extends Error {
    constructor();
}
export declare class UploaderError extends Error {
    readonly cause?: unknown | undefined;
    constructor(cause?: unknown | undefined);
}
export declare class TransactionError extends Error {
    readonly transactionHash?: string | undefined;
    readonly cause?: unknown | undefined;
    constructor(message: string, transactionHash?: string | undefined, cause?: unknown | undefined);
}
export declare class QueryError extends Error {
    readonly cause?: unknown | undefined;
    constructor(message: string, cause?: unknown | undefined);
}
export declare class AgentNotFoundError extends Error {
    readonly agentId: string;
    constructor(agentId: string);
}
//# sourceMappingURL=errors.d.ts.map