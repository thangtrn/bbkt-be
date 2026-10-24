import { BadRequestException } from '@nestjs/common';
import { RequestArgs } from './resources/agent';
import { AttackDetection } from './resources/attack-detection';
import { AuthenticationManagement } from './resources/authentication-management';
import { Cache } from './resources/cache';
import { ClientPolicies } from './resources/client-policies';
import { ClientScopes } from './resources/client-scopes';
import { Clients } from './resources/clients';
import { Components } from './resources/components';
import { Groups } from './resources/groups';
import { IdentityProviders } from './resources/identity-providers';
import { Organizations } from './resources/organizations';
import { Realms } from './resources/realms';
import { Roles } from './resources/roles';
import { ServerInfo } from './resources/server-info';
import { UserStorageProvider } from './resources/user-storage-provider';
import { Users } from './resources/users';
import { WhoAmI } from './resources/who-am-i';
import { Credentials, getToken } from './utils/auth';
import { defaultBaseUrl, defaultRealm } from './utils/constants';

export interface TokenProvider {
  getAccessToken: () => Promise<string | undefined>;
}

export interface ConnectionConfig {
  baseUrl?: string;
  realmName?: string;
  requestOptions?: RequestInit;
  requestArgOptions?: Pick<RequestArgs, 'catchNotFound'>;
}

export class KeycloakAdminClient {
  // Resources
  public users: Users;
  public userStorageProvider: UserStorageProvider;
  public groups: Groups;
  public roles: Roles;
  public organizations: Organizations;
  public clients: Clients;
  public realms: Realms;
  public clientScopes: ClientScopes;
  public clientPolicies: ClientPolicies;
  public identityProviders: IdentityProviders;
  public components: Components;
  public serverInfo: ServerInfo;
  public whoAmI: WhoAmI;
  public attackDetection: AttackDetection;
  public authenticationManagement: AuthenticationManagement;
  public cache: Cache;

  // Members
  public baseUrl: string;
  public realmName: string;
  public scope?: string;
  public accessToken?: string;
  public refreshToken?: string;

  requestOptions?: RequestInit;
  globalRequestArgOptions?: Pick<RequestArgs, 'catchNotFound'>;
  tokenProvider?: TokenProvider;

  constructor(connectionConfig?: ConnectionConfig) {
    this.baseUrl = connectionConfig?.baseUrl || defaultBaseUrl;
    this.realmName = connectionConfig?.realmName || defaultRealm;
    this.requestOptions = connectionConfig?.requestOptions;
    this.globalRequestArgOptions = connectionConfig?.requestArgOptions;

    // Initialize resources
    this.users = new Users(this);
    this.userStorageProvider = new UserStorageProvider(this);
    this.groups = new Groups(this);
    this.roles = new Roles(this);
    this.organizations = new Organizations(this);
    this.clients = new Clients(this);
    this.realms = new Realms(this);
    this.clientScopes = new ClientScopes(this);
    this.clientPolicies = new ClientPolicies(this);
    this.identityProviders = new IdentityProviders(this);
    this.components = new Components(this);
    this.authenticationManagement = new AuthenticationManagement(this);
    this.serverInfo = new ServerInfo(this);
    this.whoAmI = new WhoAmI(this);
    this.attackDetection = new AttackDetection(this);
    this.cache = new Cache(this);
  }

  public async auth(credentials: Credentials): Promise<void> {
    const { accessToken, refreshToken } = await getToken({
      baseUrl: this.baseUrl,
      realmName: this.realmName,
      scope: this.scope,
      credentials,
      requestOptions: this.requestOptions,
    });

    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  public registerTokenProvider(provider: TokenProvider): void {
    if (this.tokenProvider) {
      throw new BadRequestException(
        'An existing token provider was already registered.',
      );
    }

    this.tokenProvider = provider;
  }

  public setAccessToken(token: string): void {
    this.accessToken = token;
  }

  public async getAccessToken(): Promise<string | undefined> {
    if (this.tokenProvider) {
      return this.tokenProvider.getAccessToken();
    }

    return this.accessToken;
  }

  public getRequestOptions(): RequestInit | undefined {
    return this.requestOptions;
  }

  public getGlobalRequestArgOptions():
    | Pick<RequestArgs, 'catchNotFound'>
    | undefined {
    return this.globalRequestArgOptions;
  }

  public setConfig(connectionConfig: ConnectionConfig): void {
    if (
      typeof connectionConfig.baseUrl === 'string' &&
      connectionConfig.baseUrl
    ) {
      this.baseUrl = connectionConfig.baseUrl;
    }

    if (
      typeof connectionConfig.realmName === 'string' &&
      connectionConfig.realmName
    ) {
      this.realmName = connectionConfig.realmName;
    }
    this.requestOptions = connectionConfig.requestOptions;
  }
}
