import OrganizationDomainRepresentation from './organization-domain-representation';

export default interface OrganizationRepresentation {
  id?: string;
  name?: string;
  description?: string;
  redirectUrl?: string;
  enabled?: boolean;
  attributes?: Record<string, string[]>;
  domains?: OrganizationDomainRepresentation[];
}
