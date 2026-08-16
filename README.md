# js-moi-agent-registry

TypeScript SDK for the **AgentRegistryLogic** contract on [MOI](https://moi.technology) — a protocol-agnostic on-chain registry for AI agents.

Register any agent framework (Google A2A, Fetch.ai uAgent, Anthropic MCP, or custom) with a unique on-chain identity. The registry stores a lean profile for discovery and ownership. Full agent metadata lives off-chain at a URI you control.

---

## Installation

```bash
npm install js-moi-agent-registry
```

---

## Quick Start

```ts
import { Wallet, VoyageProvider } from 'js-moi-sdk';
import { AgentRegistry } from 'js-moi-agent-registry';

const provider = new VoyageProvider('devnet');
const wallet = await Wallet.fromMnemonic(mnemonic, derivationPath);
wallet.connect(provider);

const registry = await AgentRegistry.init({
  wallet,
  uploader: async (cardJson) => {
    // upload to IPFS, return the URI
    const { IpfsHash } = await pinToIPFS(cardJson);
    return `ipfs://${IpfsHash}`;
  },
});

const agentId = await registry.createAgent(
  { protocol: 'a2a', protocolVersion: '1.0' },
  {
    name: 'Weather Agent',
    description: 'Real-time weather forecasts for any location.',
    version: '1.0.0',
    url: 'https://weather-agent.example.com',
    agentWallet: '0xabc...',
    skills: [
      {
        id: 'get-forecast',
        name: 'Get Forecast',
        description: 'Returns a 7-day weather forecast.',
        tags: ['weather', 'forecast'],
      },
    ],
  }
);

console.log(agentId); // "agent_1"
```

---

## Initialisation

```ts
const registry = await AgentRegistry.init(config);
```

The contract logic ID and manifest are baked into the SDK and fetched from the MOI network at startup. Callers only need a connected wallet.

```ts
interface SDKConfig {
  wallet:    Signer;        // connected js-moi-sdk Signer (e.g. a Wallet)
  uploader?: CardUploader;  // required for createAgent
}

type CardUploader = (cardJson: string) => Promise<string>;
```

`uploader` receives the serialised agent card JSON and must return a resolvable URI (IPFS CID, HTTPS URL, etc.).

---

## Write Methods

### `createAgent(spec, info)`

Builds the agent card, uploads it via `uploader`, and registers on-chain in one call.

```ts
const agentId = await registry.createAgent(
  { protocol: 'a2a', protocolVersion: '1.0' },
  {
    name:            'Weather Agent',
    description:     'Real-time weather forecasts.',
    version:         '1.0.0',
    url:             'https://weather-agent.example.com',
    agentWallet:     '0xabc...',
    capabilities:    { streaming: false, pushNotifications: true },
    preferredTransport: 'JSONRPC',
    skills: [{ id: 'get-forecast', name: 'Get Forecast', description: '...' }],
  }
);
```

| Parameter | Type | Description |
|---|---|---|
| `spec.protocol` | `string` | `"a2a"` \| `"uagent"` \| `"mcp"` \| ... |
| `spec.protocolVersion` | `string` | e.g. `"1.0"` |
| `info.name` | `string` | Agent display name |
| `info.description` | `string` | What the agent does |
| `info.version` | `string` | Agent version (semver) |
| `info.url` | `string` | Agent service endpoint |
| `info.agentWallet` | `string` | Account id the agent operates from |
| `info.defaultInputModes` | `string[]` | Optional. Default `["text/plain"]` |
| `info.defaultOutputModes` | `string[]` | Optional. Default `["text/plain"]` |
| `info.capabilities` | `AgentCapabilitiesInput` | Optional. All fields default to `false` |
| `info.preferredTransport` | `string` | Optional. `"JSONRPC"` \| `"GRPC"` \| `"HTTP+JSON"`. Default `"JSONRPC"` |
| `info.iconUrl` | `string` | Optional |
| `info.documentationUrl` | `string` | Optional |
| `info.skills` | `AgentSkillInput[]` | Optional |

**Returns** `Promise<string>` — the assigned `agent_id`

**Throws** `UploaderRequiredError` · `UploaderError` · `TransactionError`

---

### `registerAgent(input)`

Low-level registration for callers that already hold a `cardUri`.

```ts
const agentId = await registry.registerAgent({
  url:         'https://weather-agent.example.com',
  cardUri:     'ipfs://bafybei...',
  agentWallet: '0xabc...',
});
```

**Returns** `Promise<string>` — the assigned `agent_id`

**Throws** `TransactionError`

---

### `updateAgentWallet(agentId, agentWallet)`

Updates the account id of the wallet the agent itself operates from (separate from `owner`, which
controls it). Owner-only. Rejected once the agent's status is `DEPRECATED`.

```ts
await registry.updateAgentWallet('agent_1', '0xnewagentwallet...');
```

**Throws** `TransactionError`

---

### `updateCard(input)`

Updates the service URL and card URI. Owner-only. Rejected once the agent's status is
`DEPRECATED` (terminal — see `setAgentStatus`). The same restriction applies to
`updateAgentWallet`.

```ts
await registry.updateCard({
  agentId: 'agent_1',
  url:     'https://weather-agent-v2.example.com',
  cardUri: 'ipfs://bafkrei...',
});
```

**Throws** `TransactionError`

---

### `setAgentStatus(agentId, status)`

Sets the lifecycle status. Owner-only. `ACTIVE` and `PAUSED` can move freely between each other;
`DEPRECATED` is terminal — once set, no further status change is allowed, and `updateCard`/
`updateAgentWallet` stop working for that agent too.

```ts
await registry.setAgentStatus('agent_1', AgentStatus.PAUSED);
await registry.setAgentStatus('agent_1', AgentStatus.ACTIVE);
await registry.setAgentStatus('agent_1', AgentStatus.DEPRECATED);
```

**Throws** `TransactionError`

---

### `setScore(agentId, score)`

Sets the agent's trust score. **Admin-only** — the connected wallet must be the registry's admin
account id, enforced on-chain. This is not owner-controlled; calling it as a regular agent owner
will fail with `TransactionError`.

```ts
await registry.setScore('agent_1', 850n);
```

**Throws** `TransactionError`

---

### `transferAgent(agentId, newOwner)`

Transfers ownership to a new wallet. Single atomic operation — no accept step.

```ts
await registry.transferAgent('agent_1', '0xnewowner...');
```

**Throws** `TransactionError`

---

## Read Methods

### `getAgentProfile(agentId)`

Returns the full on-chain profile. Returns `{ found: false, profile: null }` if the agent does not exist — does not throw.

```ts
const { profile, found } = await registry.getAgentProfile('agent_1');

if (found) {
  console.log(profile.owner);        // controls the agent
  console.log(profile.agent_wallet); // account id the agent operates from
  console.log(profile.url);
  console.log(profile.card_uri);
  console.log(profile.status);       // "ACTIVE" | "PAUSED" | "DEPRECATED"
}
```

**Throws** `QueryError`

---

### `getAgentsByOwner(accountId, offset, limit)`

Calls the contract's `GetAgentsByOwner` directly — a bounded `[offset, offset + limit)` slice, not
the owner's full list. The contract clamps `limit` to its own internal maximum regardless of what's
requested. Use `total` to decide whether to request another slice at `offset + ids.length`.

```ts
const { ids, total } = await registry.getAgentsByOwner('0xabc...', 0, 25);
```

---

### `getMyAgents(offset, limit)`

Same as `getAgentsByOwner`, for the connected wallet.

```ts
const { ids, total } = await registry.getMyAgents(0, 25);
```

---

### `getAllAgentIds(offset, limit)`

Calls the contract's `GetAllAgentIds` directly — a bounded `[offset, offset + limit)` slice, not the
full registry. Same bounding behaviour as `getAgentsByOwner`. `getAgentCount()` is cheaper if you
only need the total.

```ts
const { ids, total } = await registry.getAllAgentIds(0, 25);
```

---

### `getAgentCount()`

Returns the total number of registered agents.

```ts
const count = await registry.getAgentCount(); // bigint
```

All read methods **throw** `QueryError` on failure.

---

## Agent Card Format

`card_uri` must point to a JSON file with this envelope:

```json
{
  "spec": {
    "protocol": "a2a",
    "protocol_version": "1.0"
  },
  "agent_card": {
    "name": "Weather Agent",
    "description": "Real-time weather forecasts.",
    "version": "1.0.0",
    "url": "https://weather-agent.example.com",
    "default_input_modes": ["text/plain"],
    "default_output_modes": ["text/plain", "application/json"],
    "capabilities": {
      "streaming": false,
      "push_notifications": true,
      "state_transition_history": false
    },
    "preferred_transport": "JSONRPC",
    "icon_url": "",
    "documentation_url": "",
    "skills": [
      {
        "id": "get-forecast",
        "name": "Get Forecast",
        "description": "Returns a 7-day weather forecast.",
        "tags": ["weather"],
        "examples": ["What is the weather in London?"],
        "input_modes": ["text/plain"],
        "output_modes": ["text/plain", "application/json"]
      }
    ]
  }
}
```

The `spec` envelope is protocol-agnostic — the `agent_card` body follows whatever format the target protocol requires. Use `buildAgentCard` and `agentCardToJson` to generate this from TypeScript:

```ts
import { buildAgentCard, agentCardToJson } from 'js-moi-agent-registry';

const json = agentCardToJson(
  buildAgentCard(
    { protocol: 'a2a', protocolVersion: '1.0' },
    { name: 'Weather Agent', description: '...', version: '1.0.0', url: '...' }
  )
);
```

---

## Types

```ts
interface AgentProfile {
  agent_id:     string;
  owner:        string;        // controls the agent
  agent_wallet: string;        // account id the agent operates from
  status:       AgentStatus;
  url:          string;
  card_uri:     string;
  score:        bigint;        // admin-set only, 0 by default
  created_at:   bigint;
  updated_at:   bigint;
}

enum AgentStatus {
  ACTIVE     = 'ACTIVE',
  PAUSED     = 'PAUSED',
  DEPRECATED = 'DEPRECATED',
}

interface AgentIdsResult {
  ids:   string[];
  total: bigint;
}
```

---

## Errors

```ts
import {
  ContractLoadError,
  UploaderRequiredError,
  UploaderError,
  TransactionError,
  QueryError,
} from 'js-moi-agent-registry';
```

| Class | Thrown when |
|---|---|
| `ContractLoadError` | Manifest fetch from MOI network failed at `init` |
| `UploaderRequiredError` | `createAgent` called without `uploader` in config |
| `UploaderError` | `uploader` threw or rejected |
| `TransactionError` | On-chain transaction failed, or succeeded with an unusable result |
| `QueryError` | A read call failed |

A missing agent isn't an error: `getAgentProfile` returns `{ found: false, profile: null }` instead
of throwing.

---

## License

MIT
