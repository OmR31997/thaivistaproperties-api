import { NestFactory } from '@nestjs/core';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule, ObserveInstrument } from '@app/app.module';

async function bootstrap() {
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

  app.setGlobalPrefix('api', {
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
    .build();
  SwaggerModule.setup(
    'api/docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
    { useGlobalPrefix: false },
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
