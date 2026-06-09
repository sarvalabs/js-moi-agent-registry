export class ContractLoadError extends Error {
  constructor(public readonly cause?: unknown) {
    super(`Failed to load AgentRegistryLogic contract: ${cause instanceof Error ? cause.message : String(cause)}`);
    this.name = 'ContractLoadError';
  }
}

export class SignerRequiredError extends Error {
  constructor(public readonly operation: string) {
    super(`A private key is required to call ${operation}. Pass privateKey in SDKConfig.`);
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
  constructor(public readonly cause?: unknown) {
    super(`Card upload failed: ${cause instanceof Error ? cause.message : String(cause)}`);
    this.name = 'UploaderError';
  }
}

export class TransactionError extends Error {
  constructor(
    message: string,
    public readonly transactionHash?: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'TransactionError';
  }
}

export class QueryError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'QueryError';
  }
}

export class AgentNotFoundError extends Error {
  constructor(public readonly agentId: string) {
    super(`Agent not found: ${agentId}`);
    this.name = 'AgentNotFoundError';
  }
}
