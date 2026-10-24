export interface ClaimVerifyResult {
  readonly userId: string;
  readonly clientId: string;
  readonly sub: string;
  readonly isValid: boolean;
  readonly error?: any;
}

export interface TokenHeader {
  kid: string;
  alg: string;
}

export interface PublicKey {
  alg: string;
  e: string;
  kid: string;
  kty: string;
  n: string;
  use: string;
}

interface PublicKeyMeta {
  instance: PublicKey;
  pem: string;
}

export interface PublicKeys {
  keys: PublicKey[];
}

export interface MapOfKidToPublicKey {
  [key: string]: PublicKeyMeta;
}

// TODO: add more fields as needed
export interface KeycloakClaim {
  exp: number;
  iat: number;
  jti: string;
  iss: string;
  aud: string;
  sub: string;
  typ: string;
  azp: string;
  session_state: string;
  acr: string;
  'allowed-origins': string[];
  realm_access: {
    roles: string[];
  };
  resource_access: {
    [key: string]: {
      roles: string[];
    };
  };
  scope: string;
  sid: string;
  email_verified: boolean;
  name: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  username: string;
  email: string;
}
