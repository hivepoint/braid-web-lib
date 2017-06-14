import { Rest } from './rest';
import { Utils } from './utils';
import { ClientDb } from './db';
import { RegistrationResponse, ChannelServerResponse, ChannelCreateRequest, GetChannelResponse, ChannelListResponse } from './interfaces';

export * from './interfaces';

export interface ChannelsClient {
  register(serverUrl: string, identity: any): Promise<RegistrationResponse>;
  createChannel(registryUrl: string, request: ChannelCreateRequest): Promise<GetChannelResponse>;
  connectToChannel(channelCodeUrl: string): Promise<GetChannelResponse>;
  getChannelsWithProvider(registryUrl: string): Promise<GetChannelResponse[]>;
  listAllChannels(): Promise<GetChannelResponse[]>;
  getChannel(registryUrl: string, channelUrl: string): Promise<GetChannelResponse>;
}

class ChannelsClientImpl implements ChannelsClient {
  private db: ClientDb;

  constructor() {
    this.db = new ClientDb();
  }

  async ensureDb(): Promise<void> {
    await this.db.open();
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

  async connectToChannel(channelCodeUrl: string): Promise<GetChannelResponse> {
    return null;
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
}

(window as any).ChannelsClient = ChannelsClientImpl;