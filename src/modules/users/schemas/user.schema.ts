import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { generatePublicId } from '@common/utils/public-id';

export type UserDocument = HydratedDocument<User>;
export type UserStatus = 'ACTIVE' | 'INACTIVE';

@Schema({ timestamps: true })
export class User {
  @Prop({
    required: true,
    unique: true,
    index: true,
    default: () => generatePublicId('USR'),
  })
  publicId!: string;

  @Prop({ required: true, unique: true, index: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ default: 'Sub Admin' })
  role!: string;

  @Prop({ enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' })
  status!: UserStatus;

  @Prop()
  avatar?: string;

  @Prop()
  lastLoginAt?: Date;

  @Prop({ select: false })
  refreshTokenHash?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index(
  { role: 1 },
  {
    unique: true,
    partialFilterExpression: { role: 'Super Admin' },
    name: 'one_super_admin_only',
  },
);
