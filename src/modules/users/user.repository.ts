import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '@modules/users/schemas/user.schema';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async findByRole(role: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ role }).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  async findById(userId: string): Promise<UserDocument | null> {
    return this.userModel.findById(userId).select('+refreshTokenHash').exec();
  }

  async updateLastLogin(userId: UserDocument['_id']): Promise<void> {
    await this.userModel.updateOne({ _id: userId }, { lastLoginAt: new Date() }).exec();
  }

  async updateRefreshTokenHash(
    userId: UserDocument['_id'],
    refreshTokenHash: string,
  ): Promise<void> {
    await this.userModel.updateOne({ _id: userId }, { refreshTokenHash }).exec();
  }

  async clearRefreshTokenHash(userId: string): Promise<void> {
    await this.userModel
      .updateOne({ _id: userId }, { $unset: { refreshTokenHash: 1 } })
      .exec();
  }

  async create(data: Partial<User>): Promise<UserDocument> {
    return this.userModel.create(data);
  }
}
