import ClientPolicyRepresentation from './client-policy-representation';

/**
 * https://www.keycloak.org/docs-api/15.0/rest-api/#_clientpoliciesrepresentation
 */
export default interface ClientPoliciesRepresentation {
  globalPolicies?: ClientPolicyRepresentation[];
  policies?: ClientPolicyRepresentation[];
}
