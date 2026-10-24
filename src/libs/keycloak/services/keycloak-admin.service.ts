import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { KeycloakAdminClient } from '../client';
import PolicyRepresentation from '../defs/policy-representation';
import ResourceRepresentation from '../defs/resource-representation';
import RoleRepresentation, {
  RoleMappingPayload,
} from '../defs/role-pepresentation';
import ScopeRepresentation from '../defs/scope-representation';
import UserRepresentation from '../defs/user-representation';
import { KeycloakOptions } from '../interfaces';
import { KEYCLOAK_OPTIONS } from '../keycloak.module-definition';
import { PolicyQuery } from '../resources/clients';
import { UserQuery } from '../resources/users';
import { Credentials } from '../utils';

@Injectable()
export class KeycloakAdminService {
  private readonly kcAdminClient: KeycloakAdminClient;
  private readonly _clientId: string;
  private readonly _credential: Credentials;
  private _accessTokenExpiresIn: number;

  constructor(@Inject(KEYCLOAK_OPTIONS) private options: KeycloakOptions) {
    this._clientId = this.options.clientId;

    // if missing both service account and username/password, throw an error
    if (
      !this.options.serviceAccountId &&
      !this.options.serviceAccountSecret &&
      (!this.options.username || !this.options.password)
    ) {
      throw new BadRequestException(
        'Service account or username/password must be provided',
      );
    }

    if (this.options.serviceAccountId && this.options.serviceAccountSecret) {
      this._credential = {
        clientId: this.options.serviceAccountId,
        clientSecret: this.options.serviceAccountSecret,
        grantType: 'client_credentials',
      };
    }
    if (this.options.username && this.options.password) {
      this._credential = {
        username: this.options.username,
        password: this.options.password,
        grantType: 'password',
        clientId: 'admin-cli',
      };
    }

    this.kcAdminClient = new KeycloakAdminClient({
      baseUrl: this.options.url,
      realmName: this.options.realm,
    });
  }

  private async _initAuth(): Promise<void> {
    // If the token is still valid, return
    if (this._accessTokenExpiresIn > Date.now()) {
      return;
    }

    await this.kcAdminClient.auth(this._credential);
    this._accessTokenExpiresIn = Date.now() + 5 * 60 * 1000 - 5 * 1000; // 5 minutes, expiring 5 seconds early to be safe
  }

  async withAuth<T>(handler: () => Promise<T>): Promise<T> {
    await this._initAuth();
    return await handler();
  }

  /** ========================= USER ========================= */
  async findUsers(payload?: UserQuery): Promise<UserRepresentation[]> {
    return this.withAuth(async () => {
      return await this.kcAdminClient.users.find({ ...payload, max: -1 });
    });
  }

  async createUser(payload: UserRepresentation): Promise<{ id: string }> {
    return this.withAuth(async () => {
      return await this.kcAdminClient.users.create(payload, {});
    });
  }

  async updateUser(id: string, payload: UserRepresentation): Promise<void> {
    return this.withAuth(async () => {
      await this.kcAdminClient.users.update({ id }, payload);
    });
  }

  async deleteUser(id: string): Promise<void> {
    return this.withAuth(async () => {
      await this.kcAdminClient.users.del({ id });
    });
  }

  async findOneUser(id: string): Promise<UserRepresentation | undefined> {
    return this.withAuth(async () => {
      return await this.kcAdminClient.users.findOne({
        id,
      });
    });
  }

  async listRolesOfUser(id: string): Promise<RoleMappingPayload[]> {
    return this.withAuth(async () => {
      return await this.kcAdminClient.users.listRoleMappingsOfUser({
        id,
        clientUniqueId: this._clientId,
      });
    });
  }

  async addClientRoleMappings(
    userId: string,
    roles: RoleMappingPayload[],
  ): Promise<void> {
    return this.withAuth(async () => {
      return await this.kcAdminClient.users.addClientRoleMappings({
        id: userId,
        clientUniqueId: this._clientId,
        roles,
      });
    });
  }

  async deleteClientRoleMappings(
    userId: string,
    roles: RoleMappingPayload[],
  ): Promise<void> {
    return this.withAuth(async () => {
      return await this.kcAdminClient.users.delClientRoleMappings({
        id: userId,
        clientUniqueId: this._clientId,
        roles,
      });
    });
  }

  /** ========================= USER ========================= */

  /** ========================= ROLE ========================= */
  async createRole(payload: RoleRepresentation): Promise<{ roleName: string }> {
    return this.withAuth(async () => {
      return await this.kcAdminClient.clients.createRole({
        ...payload,
        id: this._clientId,
        clientRole: true,
      });
    });
  }

  async findRoles(): Promise<RoleRepresentation[]> {
    return this.withAuth(async () => {
      return await this.kcAdminClient.clients.listRoles({
        id: this._clientId,
      });
    });
  }

  async findRole(roleName: string): Promise<RoleRepresentation | null> {
    return this.withAuth(async () => {
      return await this.kcAdminClient.clients.findRole({
        id: this._clientId,
        roleName,
      });
    });
  }

  async updateRole(
    roleName: string,
    payload: RoleRepresentation,
  ): Promise<void> {
    return this.withAuth(async () => {
      await this.kcAdminClient.clients.updateRole(
        { id: this._clientId, roleName },
        {
          ...payload,
          name: roleName, // Keycloak will overwrite the role name as empty if not provided
        },
      );
    });
  }

  async deleteRole(roleName: string): Promise<void> {
    return this.withAuth(async () => {
      await this.kcAdminClient.clients.delRole({
        id: this._clientId,
        roleName,
      });
    });
  }

  async findUsersWithRole(roleName: string): Promise<UserRepresentation[]> {
    return this.withAuth(async () => {
      return await this.kcAdminClient.clients.findUsersWithRole({
        id: this._clientId,
        roleName,
      });
    });
  }
  /** ========================= ROLE ========================= */

  /** ========================= AUTHZ: RESOURCE ========================= */
  async createResource(
    payload: ResourceRepresentation,
  ): Promise<ResourceRepresentation> {
    return this.withAuth(async () => {
      return await this.kcAdminClient.clients.createResource(
        { id: this._clientId },
        payload,
      );
    });
  }

  async findResources(pagination?: {
    name?: string;
    first?: number;
    max?: number;
  }): Promise<ResourceRepresentation[]> {
    return this.withAuth(async () => {
      return await this.kcAdminClient.clients.listResources({
        id: this._clientId,
        ...pagination,
        max: pagination?.max ?? -1, // Gán mặc định tại đây
      });
    });
  }

  async findResource(
    resourceId: string,
  ): Promise<ResourceRepresentation | null> {
    return this.withAuth(async () => {
      return await this.kcAdminClient.clients.getResource({
        id: this._clientId,
        resourceId,
      });
    });
  }

  async updateResource(
    resourceId: string,
    payload: ResourceRepresentation,
  ): Promise<void> {
    return this.withAuth(async () => {
      await this.kcAdminClient.clients.updateResource(
        { id: this._clientId, resourceId },
        payload,
      );
    });
  }

  async deleteResource(resourceId: string): Promise<void> {
    return this.withAuth(async () => {
      await this.kcAdminClient.clients.delResource({
        id: this._clientId,
        resourceId,
      });
    });
  }
  /** ========================= AUTHZ: RESOURCE ========================= */

  /** ========================= AUTHZ: SCOPE ========================= */
  async createScope(
    payload: ScopeRepresentation,
  ): Promise<ScopeRepresentation> {
    return this.withAuth(async () => {
      return await this.kcAdminClient.clients.createAuthorizationScope(
        { id: this._clientId },
        payload,
      );
    });
  }

  async findScopes(payload?: {
    id?: string;
    name?: string;
  }): Promise<ScopeRepresentation[]> {
    return this.withAuth(async () => {
      return await this.kcAdminClient.clients.listAllScopes({
        id: this._clientId,
        ...payload,
      });
    });
  }

  async findScope(id: string): Promise<ScopeRepresentation> {
    return this.withAuth(async () => {
      return await this.kcAdminClient.clients.findScope({
        id: this._clientId,
        scopeId: id,
      });
    });
  }

  async updateScope(
    scopeId: string,
    payload: ScopeRepresentation,
  ): Promise<void> {
    return this.withAuth(async () => {
      await this.kcAdminClient.clients.updateAuthorizationScope(
        { id: this._clientId, scopeId },
        payload,
      );
    });
  }

  async deleteScope(scopeId: string): Promise<void> {
    return this.withAuth(async () => {
      await this.kcAdminClient.clients.delAuthorizationScope({
        id: this._clientId,
        scopeId,
      });
    });
  }
  /** ========================= AUTHZ: SCOPE ========================= */

  /** ========================= AUTHZ: POLICY ========================= */
  async createPolicy(
    type: string,
    payload: PolicyRepresentation,
  ): Promise<PolicyRepresentation> {
    return this.withAuth(async () => {
      return await this.kcAdminClient.clients.createPolicy(
        { id: this._clientId, type },
        payload,
      );
    });
  }

  async findPolicies(
    payload?: PolicyQuery,
  ): Promise<PolicyRepresentation[] | ''> {
    return this.withAuth(async () => {
      const policies = await this.kcAdminClient.clients.listPolicies({
        ...payload,
        id: this._clientId,
      });

      return policies === '' ? [] : policies;
    });
  }

  async findPolicy(policyId: string, type: string): Promise<void> {
    return this.withAuth(async () => {
      return await this.kcAdminClient.clients.findOnePolicy({
        id: this._clientId,
        type,
        policyId,
      });
    });
  }

  async findPolicyByName(name: string): Promise<PolicyRepresentation> {
    return this.withAuth(async () => {
      return await this.kcAdminClient.clients.findPolicyByName({
        id: this._clientId,
        name,
      });
    });
  }

  async findPolicyDependentPermissions(
    policyId: string,
  ): Promise<PolicyRepresentation[]> {
    return this.withAuth(async () => {
      return await this.kcAdminClient.clients.listDependentPolicies({
        id: this._clientId,
        policyId,
      });
    });
  }

  async updatePolicy(
    policyId: string,
    type: string,
    payload: PolicyRepresentation,
  ): Promise<void> {
    return this.withAuth(async () => {
      await this.kcAdminClient.clients.updatePolicy(
        { id: this._clientId, type, policyId },
        payload,
      );
    });
  }

  async deletePolicy(policyId: string): Promise<void> {
    return this.withAuth(async () => {
      await this.kcAdminClient.clients.delPolicy({
        id: this._clientId,
        policyId,
      });
    });
  }

  /** ========================= AUTHZ: POLICY ========================= */

  /** ========================= AUTHZ: PERMISSION ========================= */
  async createPermission(
    type: string,
    payload: PolicyRepresentation,
  ): Promise<PolicyRepresentation> {
    return this.withAuth(async () => {
      return await this.kcAdminClient.clients.createPermission(
        { id: this._clientId, type },
        payload,
      );
    });
  }

  async updatePermission(
    permissionId: string,
    type: string,
    payload: PolicyRepresentation,
  ): Promise<void> {
    return this.withAuth(async () => {
      await this.kcAdminClient.clients.updatePermission(
        { id: this._clientId, type, permissionId },
        payload,
      );
    });
  }

  async findPermissions(
    payload?: PolicyQuery,
  ): Promise<PolicyRepresentation[]> {
    return this.withAuth(async () => {
      return await this.kcAdminClient.clients.findPermissions({
        ...payload,
        id: this._clientId,
      });
    });
  }

  async findPermissionAssociatedScopes(
    permissionId: string,
  ): Promise<{ id: string; name: string }[]> {
    return this.withAuth(async () => {
      return await this.kcAdminClient.clients.getAssociatedScopes({
        id: this._clientId,
        permissionId,
      });
    });
  }
  /** ========================= AUTHZ: PERMISSION ========================= */

  /** ========================= SESSIONS ========================= */
  async logout(id: string): Promise<void> {
    return this.withAuth(async () => {
      return await this.kcAdminClient.users.logout({
        id,
      });
    });
  }
  /** ========================= SESSIONS ========================= */
}
