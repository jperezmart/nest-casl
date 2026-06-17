import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // allow the Vite/React tester to call the API
  const port = Number(process.env['PORT'] ?? 3000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`backend-simple listening on http://localhost:${port}`);
}

void bootstrap();
