import { Injectable, Logger } from '@nestjs/common';
import { randomBytes, scryptSync } from 'node:crypto';
import { UserRepository } from '@modules/users/user.repository';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async ensureDefaultSuperAdmin(email: string, password: string): Promise<void> {
    const existing = await this.userRepository.findByRole('Super Admin');
    if (existing) {
      this.logger.log('Super admin already exists; default admin creation skipped');
      return;
    }

    try {
      await this.userRepository.create({
        email,
        name: 'Super Admin',
        passwordHash: this.hashPassword(password),
        role: 'Super Admin',
      });
      this.logger.log('Default super admin created');
    } catch (error: unknown) {
      if (this.isDuplicateKeyError(error)) {
        this.logger.log('Another process created the super admin; creation skipped');
        return;
      }
      throw error;
    }
  }

  private hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
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
