import CredentialRepresentation from './credential-representation';
import FederatedIdentityRepresentation from './federated-identity-representation';
import { RequiredActionAlias } from './required-action-provider-representation';
import { RoleMappingPayload } from './role-pepresentation';
import UserConsentRepresentation from './user-consent-representation';
import { UserProfileMetadata } from './user-profile-metadata';

export default interface UserRepresentation {
  id?: string;
  createdTimestamp?: number;
  username?: string;
  enabled?: boolean;
  totp?: boolean;
  emailVerified?: boolean;
  disableableCredentialTypes?: string[];
  requiredActions?: (RequiredActionAlias | string)[];
  notBefore?: number;
  access?: Record<string, boolean>;

  // optional from response
  attributes?: Record<string, any>;
  clientConsents?: UserConsentRepresentation[];
  clientRoles?: Record<string, any>;
  credentials?: CredentialRepresentation[];
  email?: string;
  federatedIdentities?: FederatedIdentityRepresentation[];
  federationLink?: string;
  firstName?: string;
  groups?: RoleMappingPayload[];
  lastName?: string;
  realmRoles?: string[];
  self?: string;
  serviceAccountClientId?: string;
  userProfileMetadata?: UserProfileMetadata;
}
