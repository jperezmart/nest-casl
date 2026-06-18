import { OrpcCasl } from '@jperezmart/nest-casl/orpc';
import { Module } from '@nestjs/common';

import { MeController } from './me.controller.js';

@Module({
  controllers: [MeController],
  providers: [OrpcCasl],
})
export class MeModule {}
