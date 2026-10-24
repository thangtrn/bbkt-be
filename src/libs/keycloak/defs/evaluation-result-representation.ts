import { DecisionEffect } from './policy-representation';
import PolicyResultRepresentation from './policy-result-representation';
import ResourceRepresentation from './resource-representation';
import ScopeRepresentation from './scope-representation';

export default interface EvaluationResultRepresentation {
  resource?: ResourceRepresentation;
  scopes?: ScopeRepresentation[];
  policies?: PolicyResultRepresentation[];
  status?: DecisionEffect;
  allowedScopes?: ScopeRepresentation[];
}
