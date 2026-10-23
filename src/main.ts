import { NestFactory } from '@nestjs/core';
import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as os from 'node:os';
import { AppModule, ObserveInstrument } from '@app/app.module';

function getNetworkIp(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] ?? []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  app.use(helmet());
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix('api/v1', {
    exclude: [
      { path: '', method: RequestMethod.GET },
      { path: 'health', method: RequestMethod.GET },
      { path: 'health/live', method: RequestMethod.GET },
      { path: 'health/ready', method: RequestMethod.GET },
    ],
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Thaivista API')
    .setDescription('Thaivista API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter the JWT access token',
        in: 'header',
      },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, { useGlobalPrefix: false });

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');

  const networkIp = getNetworkIp();
  const remoteUrl = process.env.API_BASE_URL ?? process.env.REMOTE_URL;

  logger.log(` ThaiVista API Server Started`);
  logger.log(` Local URL:         http://localhost:${port}`);
  logger.log(` Local Network/LAN: http://${networkIp}:${port}`);
  if (remoteUrl) {
    logger.log(` Remote URL:        ${remoteUrl}`);
  }
  logger.log(` Swagger Docs:      http://localhost:${port}/docs`);
}
void bootstrap();

