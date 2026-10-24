/**
 * https://www.keycloak.org/docs-api/11.0/rest-api/index.html#_rolesrepresentation
 */

import RoleRepresentation from './role-pepresentation';

export default interface RolesRepresentation {
  realm?: RoleRepresentation[];
  client?: { [index: string]: RoleRepresentation[] };
  application?: { [index: string]: RoleRepresentation[] };
}
