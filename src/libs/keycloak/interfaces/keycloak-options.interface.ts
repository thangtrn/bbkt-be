export interface KeycloakOptions {
  url: string;
  realm: string;
  clientId: string;
  client: string;
  clientSecret: string;
  jwtSecretCert?: string;
  username?: string;
  password?: string;
  serviceAccountId?: string;
  serviceAccountSecret?: string;
}
