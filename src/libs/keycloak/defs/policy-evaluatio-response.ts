import AccessTokenRepresentation from './access-toke-representation';
import EvaluationResultRepresentation from './evaluation-result-representation';
import { DecisionEffect } from './policy-representation';

export default interface PolicyEvaluationResponse {
  results?: EvaluationResultRepresentation[];
  entitlements?: boolean;
  status?: DecisionEffect;
  rpt?: AccessTokenRepresentation;
}
