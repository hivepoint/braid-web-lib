import { Rest } from './rest';
import { Utils } from './utils';
import { ClientDb } from './db';
import { TransportManager, MessageCallback } from './transport-manager';
import {
  RegistrationResponse, ChannelServerResponse, ChannelCreateRequest, GetChannelResponse, ChannelListResponse,
  JoinRequestDetails, JoinResponseDetails, MessageInfo, HistoryResponseDetails, HistoryRequestDetails,
  ShareRequest, ShareResponse
} from './interfaces';

export * from './interfaces';

export interface ChannelsClient {
  register(serverUrl: string, identity: any): Promise<RegistrationResponse>;
  createChannel(registryUrl: string, request: ChannelCreateRequest): Promise<GetChannelResponse>;
  getChannelsWithProvider(registryUrl: string): Promise<GetChannelResponse[]>;
  listAllChannels(): Promise<GetChannelResponse[]>;
  getChannel(registryUrl: string, channelUrl: string): Promise<GetChannelResponse>;

  connectTransport(registryUrl: string, channelId: string, url: string): Promise<void>;
  joinChannel(request: JoinRequestDetails): Promise<JoinResponseDetails>;
}

class ChannelsClientImpl implements ChannelsClient {
  private db: ClientDb;
  private transport: TransportManager;
  private joinedChannels: { [channelId: string]: JoinResponseDetails } = {};
  private joinedChannelsByCode: { [channelCode: string]: JoinResponseDetails } = {};
  private historyCallbacks: { [channelId: string]: MessageCallback[] } = {};

  constructor() {
    this.db = new ClientDb();
    this.transport = new TransportManager();

    this.transport.historyCallback = (message, err) => {
      if (!err) {
        const joinInfo = this.joinedChannelsByCode[message.channelCode];
        if (joinInfo) {
          const cbList = this.historyCallbacks[joinInfo.channelId];
          if (cbList) {
            for (const cb of cbList) {
              try {
                cb(message);
              } catch (er) { /* noop */ }
            }
          }
        }
      }
    };
  }

  async ensureDb(): Promise<void> {
    await this.db.open();
  }

  addHistoryCallback(channelId: string, cb: MessageCallback) {
    if (cb && channelId) {
      if (!this.historyCallbacks[channelId]) {
        this.historyCallbacks[channelId] = [];
      }
      this.historyCallbacks[channelId].push(cb);
    }
  }

  removeHistoryCallback(channelId: string, cb: MessageCallback) {
    if (cb && channelId) {
      const list = this.historyCallbacks[channelId];
      if (list) {
        let index = -1;
        for (let i = 0; i < list.length; i++) {
          if (cb == list[i]) {
            index = i;
            break;
          }
        }
        if (index >= 0) {
          list.splice(index, 1);
          this.historyCallbacks[channelId] = list;
        }
      }
    }
  }

  async register(serverUrl: string, identity: any): Promise<RegistrationResponse> {
    await this.ensureDb();
    const cached = await this.db.getRegistry(null, serverUrl);
    if (cached) {
      return cached;
    }
    const serverInfo = await Rest.get<ChannelServerResponse>(serverUrl);
    if (serverInfo && serverInfo.services.registrationUrl) {
      const response = await this.getRegistry(serverInfo.services.registrationUrl, identity);
      return response;
    } else {
      throw new Error("Failed to fetch channel server info.");
    }
  }

  private async getRegistry(registryUrl: string, identity: any): Promise<RegistrationResponse> {
    await this.ensureDb();
    const cached = await this.db.getRegistry(registryUrl);
    if (cached) {
      return cached;
    }
    const response = await Rest.post<RegistrationResponse>(registryUrl, {
      identity: identity || {}
    });
    if (response) {
      await this.db.saveRegistry(response);
      return response;
    } else {
      throw new Error("Failed to register with server at " + registryUrl);
    }
  }

  async createChannel(registryUrl: string, request: ChannelCreateRequest = {}): Promise<GetChannelResponse> {
    await this.ensureDb();
    const registry = await this.db.getRegistry(registryUrl);
    if (!registry) {
      throw new Error("Failed to create channel: Provider is not registered");
    }
    const headers = { Authorization: Utils.createAuth(registry) };
    return await Rest.post<GetChannelResponse>(registry.services.createChannelUrl, request, headers);
  }

  async shareChannel(registerUrl: string, request: ShareRequest): Promise<ShareResponse> {
    await this.ensureDb();
    const registry = await this.db.getRegistry(registerUrl);
    if (!registry) {
      throw new Error("Failed to create channel: Provider is not registered");
    }
    const headers = { Authorization: Utils.createAuth(registry) };
    return await Rest.post<ShareResponse>(registry.services.shareChannelUrl, request, headers);
  }

  async getChannelsWithProvider(url: string): Promise<GetChannelResponse[]> {
    await this.ensureDb();
    const result: GetChannelResponse[] = [];
    let registry = await this.db.getRegistry(url);
    if (!registry) {
      registry = await this.db.getRegistry(null, url);
    }
    if (registry) {
      const listResponse = await this.getChannelsFromRegistry(registry);
      if (listResponse && listResponse.channels) {
        for (const cs of listResponse.channels) {
          result.push(cs);
        }
      }
    }
    return result;
  }

  async listAllChannels(): Promise<GetChannelResponse[]> {
    await this.ensureDb();
    const registeries = await this.db.getAllRegistries();
    const result: GetChannelResponse[] = [];
    for (var i = 0; i < registeries.length; i++) {
      const registry = registeries[i];
      const listResponse = await this.getChannelsFromRegistry(registry);
      if (listResponse && listResponse.channels) {
        for (const cs of listResponse.channels) {
          result.push(cs);
        }
      }
    }
    result.sort((a, b) => {
      return b.created - a.created;
    });
    return result;
  }

  private async getChannelsFromRegistry(registry: RegistrationResponse): Promise<ChannelListResponse> {
    const headers = { Authorization: Utils.createAuth(registry) };
    return await Rest.get<ChannelListResponse>(registry.services.channelListUrl, headers);
  }

  async getChannel(registryUrl: string, channelUrl: string): Promise<GetChannelResponse> {
    await this.ensureDb();
    const registry = await this.db.getRegistry(registryUrl);
    if (!registry) {
      throw new Error("Failed to fetch channel: Provider is not registered");
    }
    const headers = { Authorization: Utils.createAuth(registry) };
    return await Rest.get<GetChannelResponse>(channelUrl, headers);
  }

  async connectTransport(registryUrl: string, channelId: string, url: string): Promise<void> {
    await this.ensureDb();
    const registry = await this.db.getRegistry(registryUrl);
    if (!registry) {
      throw new Error("Failed to connect: Provider is not registered");
    }
    const fullUrl = new URL(url);
    var query = fullUrl.search || "";
    if (!query) {
      query = "?"
    } else if (query.length > 1) {
      query = query + "&"
    }
    query += "id=" + encodeURIComponent(registry.id);
    query += "&token=" + encodeURIComponent(registry.token);
    fullUrl.search = query;
    await this.transport.connect(channelId, fullUrl.toString());
  }

  async joinChannel(request: JoinRequestDetails): Promise<JoinResponseDetails> {
    return new Promise<JoinResponseDetails>((resolve, reject) => {
      this.transport.sendControlMessageByChannel(request.channelId, 'join', request, (message, err) => {
        if (err) {
          reject(err);
        } else {
          const controlMessage = message.controlMessagePayload.jsonMessage;
          const joinResponse = controlMessage.details as JoinResponseDetails;
          this.joinedChannels[request.channelId] = joinResponse;
          this.joinedChannelsByCode[joinResponse.channelCode] = joinResponse;
          resolve(joinResponse);
        }
      });
    });
  }

  async getHistory(request: HistoryRequestDetails): Promise<HistoryResponseDetails> {
    return new Promise<HistoryResponseDetails>((resolve, reject) => {
      const channelId = request.channelId;
      const joinInfo = this.joinedChannels[channelId];
      if (!joinInfo) {
        reject(new Error("Trying to fetch history of an unjoined channel"));
        return;
      }
      this.transport.sendControlMessageByChannel(channelId, 'history', request, (message, err) => {
        if (err) {
          reject(err);
        } else {
          const controlMessage = message.controlMessagePayload.jsonMessage;
          const historyResponse = controlMessage.details as HistoryResponseDetails;
          resolve(historyResponse);
        }
      });
    });
  };

  async sendMessage(channelId: string, message: any, history: boolean = false, priority: boolean = false): Promise<MessageInfo> {
    return new Promise<MessageInfo>((resolve, reject) => {
      const joinInfo = this.joinedChannels[channelId];
      if (!joinInfo) {
        reject(new Error("Trying to send message to an unjoined channel"));
        return;
      }
      const messageText = (typeof message === "string") ? message : JSON.stringify(message);
      const payload = new TextEncoder().encode(messageText);
      const messageInfo: MessageInfo = {
        channelCode: joinInfo.channelCode,
        senderCode: joinInfo.participantCode,
        history: history,
        priority: priority,
        rawPayload: payload
      };
      try {
        this.transport.send(channelId, messageInfo);
        resolve(messageInfo);
      } catch (err) {
        reject(err);
      }
    });
  }
}

(window as any).ChannelsClient = ChannelsClientImpl;