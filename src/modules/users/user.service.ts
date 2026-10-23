import { Injectable, Logger } from '@nestjs/common';
import { randomBytes, scryptSync } from 'node:crypto';
import { UserRepository } from '@modules/users/user.repository';
import { UserDocument } from '@modules/users/schemas/user.schema';
import { SUPER_ADMIN_ROLE } from '@modules/users/types/user.types';
import type { UserRole } from '@modules/users/types/user.types';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async ensureDefaultSuperAdmin(email: string, password: string): Promise<void> {
    const existing = await this.userRepository.findByRole(SUPER_ADMIN_ROLE);
    if (existing) {
      this.logger.log('Super admin already exists; default admin creation skipped');
      return;
    }

    try {
      await this.userRepository.create({
        email,
        name: 'Super Admin',
        passwordHash: this.hashPassword(password),
        role: SUPER_ADMIN_ROLE,
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

  async createUser(
    email: string,
    name: string,
    password: string,
    role: UserRole,
  ): Promise<UserDocument> {
    return this.userRepository.create({
      email: email.toLowerCase().trim(),
      name: name.trim(),
      passwordHash: this.hashPassword(password),
      role,
    });
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
