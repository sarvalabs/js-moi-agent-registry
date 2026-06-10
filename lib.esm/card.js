export function buildAgentCard(spec, input) {
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
export function agentCardToJson(card) {
    return JSON.stringify(card, null, 2);
}
//# sourceMappingURL=card.js.map