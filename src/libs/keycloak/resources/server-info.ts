import { KeycloakAdminClient } from '../client';
import EffectiveMessageBundleRepresentation from '../defs/effective-message-bundle-representation';
import { ServerInfoRepresentation } from '../defs/server-info-repesentation';
import Resource from './resource';

export interface MessageBundleQuery {
  realm: string;
  theme?: string;
  themeType?: string;
  locale?: string;
  source?: boolean;
}

export class ServerInfo extends Resource {
  constructor(client: KeycloakAdminClient) {
    super(client, {
      path: '/',
      getBaseUrl: () => client.baseUrl,
    });
  }

  public find = this.makeRequest<object, ServerInfoRepresentation>({
    method: 'GET',
    path: '/admin/serverinfo',
  });

  public findEffectiveMessageBundles = this.makeRequest<
    MessageBundleQuery,
    EffectiveMessageBundleRepresentation[]
  >({
    method: 'GET',
    path: '/resources/{realm}/{themeType}/{locale}',
    urlParamKeys: ['realm', 'themeType', 'locale'],
    queryParamKeys: ['theme', 'source'],
  });
}
