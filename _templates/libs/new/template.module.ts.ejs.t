---
to: src/libs/<%= h.changeCase.param(name) %>/<%= h.changeCase.param(name) %>.module.ts
---

import { Global, Module } from '@nestjs/common';
import { <%= h.changeCase.pascal(name) %>ModuleClass } from './<%= h.changeCase.param(name) %>.module-definition';
import { <%= h.changeCase.pascal(name) %>Service } from './<%= h.changeCase.param(name) %>.service';

@Global()
@Module({
  providers: [<%= h.changeCase.pascal(name) %>Service],
  exports: [<%= h.changeCase.pascal(name) %>Service],
})
export class <%= h.changeCase.pascal(name) %>Module extends <%= h.changeCase.pascal(name) %>ModuleClass {}
