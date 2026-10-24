import PolicyRepresentation, { DecisionEffect } from './policy-representation';

export default interface PolicyResultRepresentation {
  policy?: PolicyRepresentation;
  status?: DecisionEffect;
  associatedPolicies?: PolicyResultRepresentation[];
  scopes?: string[];
}
