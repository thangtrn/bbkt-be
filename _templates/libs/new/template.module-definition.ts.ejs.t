---
to: src/libs/<%= h.changeCase.param(name) %>/<%= h.changeCase.param(name) %>.module-definition.ts
---

import { ConfigurableModuleBuilder } from '@nestjs/common';
import { <%= h.changeCase.pascal(name) %>Options } from './interfaces';

export const {
  ConfigurableModuleClass: <%= h.changeCase.pascal(name) %>ModuleClass,
  MODULE_OPTIONS_TOKEN: <%= h.changeCase.constant(name) %>_MODULE_OPTIONS,
} = new ConfigurableModuleBuilder<<%= h.changeCase.pascal(name) %>Options>()
  .setClassMethodName('forRoot')
  .build();
