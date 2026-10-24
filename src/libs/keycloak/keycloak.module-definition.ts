import { ConfigurableModuleBuilder } from '@nestjs/common';
import { KeycloakOptions } from './interfaces/keycloak-options.interface';

export const {
  ConfigurableModuleClass: KeycloakModuleClass,
  MODULE_OPTIONS_TOKEN: KEYCLOAK_OPTIONS,
} = new ConfigurableModuleBuilder<KeycloakOptions>()
  .setClassMethodName('forRoot')
  .setExtras(
    {
      isGlobal: true,
    },
    (definition, extras) => ({
      ...definition,
      global: extras.isGlobal,
    }),
  )
  .build();
