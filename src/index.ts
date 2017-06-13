import { Rest } from './rest';
import { Utils } from './utils';
import { ClientDb } from './db';
import { RegistrationResponse, BraidResponse, ChannelCreateRequest, GetChannelResponse } from './interfaces';

export * from './interfaces';

export interface ChannelsClient {
  register(serverUrl: string, identity: any): Promise<RegistrationResponse>;
  createChannel(request: ChannelCreateRequest): Promise<GetChannelResponse>;
  connectToChannel(channelCodeUrl: string): Promise<GetChannelResponse>;
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
    const braidInfo = await Rest.get<BraidResponse>(serverUrl);
    if (braidInfo && braidInfo.services.registrationUrl) {
      const response = await this.getRegistry(braidInfo.services.registrationUrl, identity);
      await this.db.saveRegistry(response);
      return response;
    } else {
      throw new Error("Failed to fetch Braid server info.");
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
}

(window as any).ChannelsClient = ChannelsClientImpl;