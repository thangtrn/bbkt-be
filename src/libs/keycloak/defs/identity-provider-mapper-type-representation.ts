import { ConfigPropertyRepresentation } from './config-property-representation';

export interface IdentityProviderMapperTypeRepresentation {
  id?: string;
  name?: string;
  category?: string;
  helpText?: string;
  properties?: ConfigPropertyRepresentation[];
}
