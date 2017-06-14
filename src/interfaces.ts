export interface ChannelServerResponse {
  protocolVersion: string;  // e.g., "1.0.0":  conforms to which version of the specification
  provider: {
    name: string;
    logo: string;
    homepage: string;
    details: any;
  };
  implementation: {
    name: string;
    logo: string;
    homepage: string;
    version: string;
    details: any;
  };
  services: ProviderServiceList;
  implementationDetails: any; // for implementor to provide additional information
}

export interface RegistrationRequest {
  identity: any;
}

// Response from registration
export interface RegistrationResponse {
  id: string;
  token: string;
  services: ProviderServiceList;
}

export interface AccountResponse {
  id: string;
  services: ProviderServiceList;
  identity: any;
}

export interface ProviderServiceList {
  providerUrl: string;
  serviceHomeUrl: string;
  registrationUrl: string;
  accountUrl: string;
  createChannelUrl: string;
  channelListUrl: string;
}

export interface AccountUpdateRequest {
  identity: any;
}

export interface ShareRequest {
  details: any;
}

export interface ShareResponse {
  shareCodeUrl: string;
}

export interface ShareCodeResponse {
  providerUrl: string;
  registrationUrl: string;
  channelId: string;
  channelUrl: string;
  details: any;
}

export interface ChannelCreateRequest {
  options?: ChannelOptions;
  details?: any;
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
  isCreator: boolean;
  members: ChannelMemberInfo[];
  created: number;
  lastUpdated: number;
}

export interface ChannelDeleteResponseDetails {
  channelId: string;
}

export interface ChannelSummary {
  channelId: string;
  channelUrl: string;
  isCreator: boolean;
  lastActive: number;
  details?: any;
}

export interface ChannelListResponse {
  total: number;
  channels: GetChannelResponse[];
}

export interface ChannelParticipantInfo {
  participantId: string;
  code: number;
  details: any;
  isCreator: boolean;
  isYou: boolean;
  memberSince: number;
  lastActive: number;
}

export interface ControlChannelMessage {
  requestId?: string;
  type: string; // see https://github.com/ChannelElementsTeam/channel-server/wiki/Control-Channel-Messages
  details: any; // depends on type
}

export interface JoinRequestDetails {
  channelId: string;
  participantDetails?: any;
}

export interface JoinResponseDetails {
  channelId: string;
  channelCode: number;
  participantId: string;
  participantCode: number;
  participants: ChannelParticipantInfo[];
}

export interface LeaveRequestDetails {
  channelId: string;
  permanently?: boolean;
}

export interface HistoryRequestDetails {
  channelId: string;
  before: number;
  after?: number;
  maxCount: number;
}

export interface HistoryResponseDetails {
  count: number;
  total: number;
}

export interface HistoryMessageDetails {
  timestamp: number;
  channelId: string;
  participantId: string;
}

export interface PingRequestDetails {
  interval?: number;
}

export interface ErrorDetails {
  statusCode: number;
  errorMessage: string;
  channelId?: string;
}

export interface RateLimitDetails {
  channelId: string;
  options: string[];
}

export interface JoinNotificationDetails {
  channelId: string;
  participantId: string;
  participantCode: number;
  participantDetails: any;
}

export interface LeaveNotificationDetails {
  channelId: string;
  participantId: string;
  participantCode: number;
  permanently: boolean;
}

export interface ChannelDeletedNotificationDetails {
  channelId: string;
}

export interface ControlMessagePayload {
  jsonMessage: ControlChannelMessage;
  binaryPortion?: Uint8Array;
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
  topology?: string; // many-to-many, one-to-many, many-to-one
}