---
to: src/libs/<%= h.changeCase.param(name) %>/<%= h.changeCase.param(name) %>.service.ts
---

import { Inject, Injectable } from '@nestjs/common';
import { <%= h.changeCase.constant(name) %>_MODULE_OPTIONS } from './<%= h.changeCase.param(name) %>.module-definition';
import { <%= h.changeCase.pascal(name) %>Options } from './interfaces';

@Injectable()
export class <%= h.changeCase.pascal(name) %>Service {
  constructor(
    @Inject(<%= h.changeCase.constant(name) %>_MODULE_OPTIONS)
    private readonly options: <%= h.changeCase.pascal(name) %>Options,
  ) {}
}
