export interface KeycloakClientTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
  scope: string;
  'not-before-policy': number;
}
