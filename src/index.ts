import { Rest } from './rest';
import { Utils } from './utils';
import { RegistrationResponse, BraidResponse, ChannelCreateRequest, GetChannelResponse } from './interfaces';

export * from './interfaces';

export interface ChannelsClient {
  register(serverUrl: string, identity: any): Promise<RegistrationResponse>;
  createChannel(request: ChannelCreateRequest): Promise<GetChannelResponse>;
  connectToChannel(channelCodeUrl: string): Promise<GetChannelResponse>;
}

class ChannelsClientImpl implements ChannelsClient {
  private registrationMap: { [url: string]: RegistrationResponse } = {}

  async register(serverUrl: string, identity: any): Promise<RegistrationResponse> {
    if (this.registrationMap[serverUrl]) {
      return this.registrationMap[serverUrl];
    }
    const braidInfo = await Rest.get<BraidResponse>(serverUrl);
    if (braidInfo && braidInfo.registerUrl) {
      const response = await this.getRegistry(braidInfo.registerUrl, identity);
      this.registrationMap[serverUrl] = response;
      return response;
    } else {
      throw new Error("Failed to fetch Braid server info.");
    }
  }

  private async getRegistry(registryUrl: string, identity: any): Promise<RegistrationResponse> {
    if (this.registrationMap[registryUrl]) {
      return this.registrationMap[registryUrl];
    }
    const response = await Rest.post<RegistrationResponse>(registryUrl, {
      identity: identity || {}
    });
    if (response) {
      this.registrationMap[registryUrl] = response;
      this.registrationMap[response.providerUrl] = response;
      return response;
    } else {
      throw new Error("Failed to register with server at " + registryUrl);
    }
  }

  async createChannel(registryUrl: string, request: ChannelCreateRequest = {}): Promise<GetChannelResponse> {
    const registry = this.registrationMap[registryUrl];
    if (!registry) {
      throw new Error("Failed to create channel: Provider is not registered");
    }
    const headers = { Authorization: Utils.createAuth(registry) };
    return await Rest.post<GetChannelResponse>(registry.createChannelUrl, request, headers);
    // TODO: persist channels????
  }

  async connectToChannel(channelCodeUrl: string): Promise<GetChannelResponse> {
    return null;
  }
}