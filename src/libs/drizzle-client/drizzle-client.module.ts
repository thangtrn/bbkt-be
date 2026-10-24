import { Global, Module } from '@nestjs/common';
import { DrizzleClientModuleClass } from './drizzle-client.module-definition';
import { DrizzleClientService } from './drizzle-client.service';

@Global()
@Module({
  providers: [DrizzleClientService],
  exports: [DrizzleClientService],
})
export class DrizzleClientModule extends DrizzleClientModuleClass {}
