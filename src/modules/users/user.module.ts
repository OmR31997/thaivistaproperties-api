import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '@modules/users/schemas/user.schema';
import { UserRepository } from '@modules/users/user.repository';
import { UserService } from '@modules/users/user.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [UserRepository, UserService],
  exports: [UserService, UserRepository],
})
export class UserModule {}
