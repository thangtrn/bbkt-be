import { KeycloakAdminClient } from '../client';
import Resource from './resource';

export class AttackDetection extends Resource<{ realm?: string }> {
  constructor(client: KeycloakAdminClient) {
    super(client, {
      path: '/admin/realms/{realm}/attack-detection/brute-force',
      getUrlParams: () => ({
        realm: client.realmName,
      }),
      getBaseUrl: () => client.baseUrl,
    });
  }

  public findOne = this.makeRequest<
    { id: string },
    Record<string, any> | undefined
  >({
    method: 'GET',
    path: '/users/{id}',
    urlParamKeys: ['id'],
    catchNotFound: true,
  });

  public del = this.makeRequest<{ id: string }, void>({
    method: 'DELETE',
    path: '/users/{id}',
    urlParamKeys: ['id'],
  });

  public delAll = this.makeRequest<object, void>({
    method: 'DELETE',
    path: '/users',
  });
}
