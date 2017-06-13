export interface ProviderServiceList {
  providerUrl: string;
  serviceHomeUrl: string;
  registrationUrl: string;
  accountUrl: string;
  createChannelUrl: string;
  channelListUrl: string;
}

export interface RegistrationResponse {
  id: string;
  token: string;
  services: ProviderServiceList;
}

export interface BraidResponse {
  version: number;
  services: ProviderServiceList;
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
  mode?: string; // many-to-many, one-to-many, many-to-one
}

export interface ChannelMemberInfo {
  participantId: string;
  details: any;
  isCreator: boolean;
  memberSince: number;
  lastActive: number;
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