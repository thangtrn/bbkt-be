export interface KeycloakVerifyTokenResult {
  id: string;
  accessToken: string;
  username: string;
  roles: string[];
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  scopes: string;
}
