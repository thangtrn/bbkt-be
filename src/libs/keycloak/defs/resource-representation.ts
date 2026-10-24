/**
 * https://www.keycloak.org/docs-api/11.0/rest-api/index.html#_resourcerepresentation
 */
import { ResourceOwnerRepresentation } from './resource-server-representation';
import ScopeRepresentation from './scope-representation';

export default interface ResourceRepresentation {
  name?: string;
  type?: string;
  owner?: ResourceOwnerRepresentation;
  ownerManagedAccess?: boolean;
  displayName?: string;
  attributes?: { [index: string]: string[] };
  _id?: string;
  uris?: string[];
  scopes?: ScopeRepresentation[];
  icon_uri?: string;
}
