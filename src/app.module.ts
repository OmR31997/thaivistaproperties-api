import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { createObserveModule } from '@nestjs/observe';
import configuration from '@config/configuration';
import { validateEnvironment } from '@config/env.validation';
import { UserModule } from '@modules/users/user.module';
import { AuthModule } from '@modules/auth/auth.module';
import { AppController } from '@app/app.controller';
import { AppService } from '@app/app.service';
import { PropertyInquiryModule } from '@modules/property-inquiry/property-inquiry.module';
import { SharedCacheModule } from '@shared/cache/cache.module';
import { UploadModule } from '@shared/upload/upload.module';
import { PropertyModule } from '@modules/property/property.module';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnvironment,
    }),
    SharedCacheModule,
    UploadModule,
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('database.uri'),
      }),
    }),
    UserModule,
    AuthModule,
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'thaivista-api',
    }),
    PropertyInquiryModule,
    PropertyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
