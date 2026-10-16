import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserModule } from '@modules/users/user.module';
import { AuthController } from '@modules/auth/auth.controller';
import { AuthService } from '@modules/auth/auth.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('jwt.secret'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
