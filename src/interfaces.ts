export interface RegistrationResponse {
  id: string;
  token: string;
  providerUrl: string;
  accountUrl: string;
  createChannelUrl: string;
}

export interface BraidResponse {
  version: number;
  registerUrl: string;
  serviceHomeUrl: string;
}

export interface ChannelCreateRequest {
  options?: ChannelOptions;
  details?: any;
}

export interface ChannelOptions {
  history?: boolean;
  maxHistoryCount?: number;
  maxHistorySeconds?: number;
  priority?: boolean;
  maxParticipants?: number;
  maxPayloadSize?: number;
  maxMessageRate?: number;
  maxDataRate?: number;
}

export interface ChannelMemberInfo {
  identity: any;
  isCreator: boolean;
  added: number;
  lastPresent: number;
  status: string;
}

export interface GetChannelResponse {
  channelId: string;
  transportUrl: string;
  registerUrl: string;
  channelUrl: string;
  sharingUrl: string;
  options: ChannelOptions;
  details: any;
  members: ChannelMemberInfo[];
  created: number;
  lastUpdated: number;
}