import ClientProfileRepresentation from './client-profile-representation';

/**
 * https://www.keycloak.org/docs-api/15.0/rest-api/#_clientprofilesrepresentation
 */
export default interface ClientProfilesRepresentation {
  globalProfiles?: ClientProfileRepresentation[];
  profiles?: ClientProfileRepresentation[];
}
