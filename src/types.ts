import type { Signer } from 'js-moi-sdk';
import type { AgentCardInput, AgentProtocolSpec } from './card.js';

export type CardUploader = (cardJson: string) => Promise<string>;

export interface SDKConfig {
  wallet: Signer;
  uploader?: CardUploader;
}

export enum AgentStatus {
  ACTIVE     = 'ACTIVE',
  PAUSED     = 'PAUSED',
  DEPRECATED = 'DEPRECATED',
}

export interface AgentProfile {
  agent_id: string;
  owner: string;
  agent_wallet: string;
  status: AgentStatus;
  url: string;
  card_uri: string;
  score: bigint;
  created_at: bigint;
  updated_at: bigint;
}

export interface AgentInfo extends AgentCardInput {
  agentWallet: string;
}

export interface RegisterAgentInput {
  url: string;
  cardUri: string;
  agentWallet: string;
}

export interface UpdateCardInput {
  agentId: string;
  url: string;
  cardUri: string;
}

export interface GetAgentProfileOutput {
  profile: AgentProfile | null;
  found: boolean;
}
