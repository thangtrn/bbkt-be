/**
 * https://www.keycloak.org/docs-api/11.0/rest-api/index.html#_scoperepresentation
 */
import PolicyRepresentation from './policy-representation';
import ResourceRepresentation from './resource-representation';

export default interface ScopeRepresentation {
  displayName?: string;
  iconUri?: string;
  id?: string;
  name?: string;
  policies?: PolicyRepresentation[];
  resources?: ResourceRepresentation[];
}
