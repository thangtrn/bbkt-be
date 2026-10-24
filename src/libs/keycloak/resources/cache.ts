import { KeycloakAdminClient } from '../client';
import Resource from './resource';

export class Cache extends Resource<{ realm?: string }> {
  public clearUserCache = this.makeRequest<object, void>({
    method: 'POST',
    path: '/clear-user-cache',
  });

  constructor(client: KeycloakAdminClient) {
    super(client, {
      path: '/admin/realms/{realm}',
      getUrlParams: () => ({
        realm: client.realmName,
      }),
      getBaseUrl: () => client.baseUrl,
    });
  }
}
