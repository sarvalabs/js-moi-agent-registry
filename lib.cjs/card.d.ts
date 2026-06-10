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
export declare function buildAgentCard(spec: AgentProtocolSpec, input: AgentCardInput): AgentCardJson;
export declare function agentCardToJson(card: AgentCardJson): string;
//# sourceMappingURL=card.d.ts.map