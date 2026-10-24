import { KeycloakAdminClient } from '../client';
import WhoAmIRepresentation from '../defs/who-am-i-representation';
import Resource from './resource';

export class WhoAmI extends Resource<{ realm?: string }> {
  constructor(client: KeycloakAdminClient) {
    super(client, {
      path: '/admin/{realm}/console',
      getUrlParams: () => ({
        realm: client.realmName,
      }),
      getBaseUrl: () => client.baseUrl,
    });
  }

  public find = this.makeRequest<
    { currentRealm: string },
    WhoAmIRepresentation
  >({
    method: 'GET',
    path: '/whoami',
    queryParamKeys: ['currentRealm'],
  });
}
