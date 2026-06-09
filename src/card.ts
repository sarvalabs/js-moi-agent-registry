export interface AgentProtocolSpec {
  protocol: string;
  protocolVersion: string;
}

export interface AgentCapabilitiesInput {
  streaming?: boolean;
  pushNotifications?: boolean;
  stateTransitionHistory?: boolean;
}

export interface AgentSkillInput {
  id: string;
  name: string;
  description: string;
  tags?: string[];
  examples?: string[];
  inputModes?: string[];
  outputModes?: string[];
}

export interface AgentCardInput {
  name: string;
  description: string;
  version: string;
  url: string;
  defaultInputModes?: string[];
  defaultOutputModes?: string[];
  capabilities?: AgentCapabilitiesInput;
  preferredTransport?: 'JSONRPC' | 'GRPC' | 'HTTP+JSON';
  iconUrl?: string;
  documentationUrl?: string;
  skills?: AgentSkillInput[];
}

export interface AgentCardJson {
  spec: {
    protocol: string;
    protocol_version: string;
  };
  agent_card: {
    name: string;
    description: string;
    version: string;
    url: string;
    default_input_modes: string[];
    default_output_modes: string[];
    capabilities: {
      streaming: boolean;
      push_notifications: boolean;
      state_transition_history: boolean;
    };
    preferred_transport: string;
    icon_url: string;
    documentation_url: string;
    skills: {
      id: string;
      name: string;
      description: string;
      tags: string[];
      examples: string[];
      input_modes: string[];
      output_modes: string[];
    }[];
  };
}

export function buildAgentCard(spec: AgentProtocolSpec, input: AgentCardInput): AgentCardJson {
  return {
    spec: {
      protocol: spec.protocol,
      protocol_version: spec.protocolVersion,
    },
    agent_card: {
      name: input.name,
      description: input.description,
      version: input.version,
      url: input.url,
      default_input_modes: input.defaultInputModes ?? ['text/plain'],
      default_output_modes: input.defaultOutputModes ?? ['text/plain'],
      capabilities: {
        streaming: input.capabilities?.streaming ?? false,
        push_notifications: input.capabilities?.pushNotifications ?? false,
        state_transition_history: input.capabilities?.stateTransitionHistory ?? false,
      },
      preferred_transport: input.preferredTransport ?? 'JSONRPC',
      icon_url: input.iconUrl ?? '',
      documentation_url: input.documentationUrl ?? '',
      skills: (input.skills ?? []).map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        tags: s.tags ?? [],
        examples: s.examples ?? [],
        input_modes: s.inputModes ?? ['text/plain'],
        output_modes: s.outputModes ?? ['text/plain'],
      })),
    },
  };
}

export function agentCardToJson(card: AgentCardJson): string {
  return JSON.stringify(card, null, 2);
}
