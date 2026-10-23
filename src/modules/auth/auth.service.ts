import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, scryptSync, timingSafeEqual } from 'node:crypto';
import type { SignOptions } from 'jsonwebtoken';
import { RefreshTokenDto } from '@modules/auth/dto/refresh-token.dto';
import { UserRepository } from '@modules/users/user.repository';
import { UserDocument } from '@modules/users/schemas/user.schema';
import { LoginDto } from '@modules/auth/dto/login.dto';
import { SignupDto } from '@modules/auth/dto/signup.dto';
import { UserService } from '@modules/users/user.service';
import { SUPER_ADMIN_ROLE } from '@modules/users/types/user.types';
import type { UserRole } from '@modules/users/types/user.types';

interface TokenPayload {
  sub: string;
  publicId: string;
  role: UserRole;
  type: 'access' | 'refresh';
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(dto: SignupDto) {
    try {
      const user = await this.userService.createUser(dto.email, dto.name, dto.password, dto.role);
      const tokens = await this.issueTokens(user);
      return {
        success: true,
        message: 'Signup successful',
        data: {
          ...tokens,
          user: this.toPublicUser(user),
        },
      };
    } catch (error: unknown) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          dto.role === SUPER_ADMIN_ROLE
            ? 'A Super Admin already exists or the email is already registered'
            : 'Email is already registered',
        );
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user || user.status !== 'ACTIVE' || !this.verifyPassword(dto.password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.userRepository.updateLastLogin(user._id);
    const tokens = await this.issueTokens(user);
    return {
      success: true,
      message: 'Login successful',
      data: {
        ...tokens,
        user: this.toPublicUser(user),
      },
    };
  }

  async refresh(refreshToken: RefreshTokenDto['refreshToken']) {
    let payload: TokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<TokenPayload>(refreshToken, {
        secret: this.configService.getOrThrow<string>('jwt.secret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userRepository.findById(payload.sub);
    if (
      !user ||
      user.status !== 'ACTIVE' ||
      !user.refreshTokenHash ||
      !this.matchesHash(refreshToken, user.refreshTokenHash)
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return {
      success: true,
      message: 'Token refreshed',
      data: await this.issueTokens(user),
    };
  }

  async logout(userId: string) {
    await this.userRepository.clearRefreshTokenHash(userId);
    return {
      success: true,
      message: 'Logout successful',
      data: null,
    };
  }

  private async issueTokens(user: UserDocument) {
    const payload = {
      sub: user._id.toString(),
      publicId: user.publicId,
      role: user.role,
    };
    const accessToken = await this.jwtService.signAsync(
      { ...payload, type: 'access' },
      { expiresIn: this.getExpiresIn('jwt.accessExpiresIn', '15m') },
    );
    const refreshToken = await this.jwtService.signAsync(
      { ...payload, type: 'refresh' },
      { expiresIn: this.getExpiresIn('jwt.refreshExpiresIn', '7d') },
    );

    await this.userRepository.updateRefreshTokenHash(user._id, this.hashToken(refreshToken));
    return { accessToken, refreshToken };
  }

  private getExpiresIn(key: string, fallback: string): SignOptions['expiresIn'] {
    return this.configService.get<string>(key, fallback) as SignOptions['expiresIn'];
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private matchesHash(token: string, expectedHash: string): boolean {
    const actual = Buffer.from(this.hashToken(token), 'hex');
    const expected = Buffer.from(expectedHash, 'hex');
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  }

  private verifyPassword(password: string, storedHash: string): boolean {
    const [salt, expectedHex] = storedHash.split(':');
    if (!salt || !expectedHex || expectedHex.length % 2 !== 0) {
      return false;
    }
    const actual = scryptSync(password, salt, 64);
    const expected = Buffer.from(expectedHex, 'hex');
    return expected.length === actual.length && timingSafeEqual(actual, expected);
  }

  private toPublicUser(user: UserDocument) {
    return {
      publicId: user.publicId,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    };
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    );
  }
}
