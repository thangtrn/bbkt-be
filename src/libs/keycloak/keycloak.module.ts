import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { KeycloakModuleClass } from './keycloak.module-definition';
import { KeycloakService } from './services';
import { KeycloakAdminService } from './services/keycloak-admin.service';

@Module({
  imports: [HttpModule],
  providers: [KeycloakService, KeycloakAdminService],
  exports: [KeycloakService, KeycloakAdminService],
})
export class KeycloakModule extends KeycloakModuleClass {}
