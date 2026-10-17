import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CloudinaryStorageStrategy } from '@shared/upload/cloudinary-storage.strategy';
import { UploadService } from '@shared/upload/upload.service';
import { UploadController } from '@shared/upload/upload.controller';
import { UploadEvents } from '@shared/upload/upload.events';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('jwt.secret'),
      }),
    }),
  ],
  providers: [CloudinaryStorageStrategy, UploadService, JwtAuthGuard, UploadEvents],
  controllers: [UploadController],
  exports: [UploadService, UploadEvents],
})
export class UploadModule {}
