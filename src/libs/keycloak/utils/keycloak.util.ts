import { KeycloakEndpointType } from '../enums';

type EndpointMap = {
  get<T extends KeycloakEndpointType>(endpoint: T): string | undefined;
};

export function getKeycloakEndpoint(
  url: string,
  realm: string,
  type: string,
): string {
  const endpointMap = new Map([
    [
      KeycloakEndpointType.AUTHORIZATION,
      `${url}/realms/${realm}/protocol/openid-connect/auth`,
    ],
    [
      KeycloakEndpointType.TOKEN,
      `${url}/realms/${realm}/protocol/openid-connect/token`,
    ],
    [
      KeycloakEndpointType.USERINFO,
      `${url}/realms/${realm}/protocol/openid-connect/userinfo`,
    ],
    [
      KeycloakEndpointType.JWKS,
      `${url}/realms/${realm}/protocol/openid-connect/certs`,
    ],
    [
      KeycloakEndpointType.LOGOUT,
      `${url}/realms/${realm}/protocol/openid-connect/logout`,
    ],
    [
      KeycloakEndpointType.REVOKE,
      `${url}/realms/${realm}/protocol/openid-connect/logout`,
    ],
    [
      KeycloakEndpointType.DEVICE_AUTHORIZATION,
      `${url}/realms/${realm}/protocol/openid-connect/auth/device`,
    ],
  ]) as EndpointMap;

  return endpointMap.get(type as KeycloakEndpointType) ?? '';
}
