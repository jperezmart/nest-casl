import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  // oRPC owns body parsing (it reads the raw stream via the contract codec).
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.enableCors(); // allow the Vite/React tester to call the API
  const port = Number(process.env['PORT'] ?? 3002);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`backend-orpc listening on http://localhost:${port}`);
}

void bootstrap();
