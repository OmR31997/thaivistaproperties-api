import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'CurrentSecret123!', minLength: 8, description: 'Current password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  currentPassword!: string;

  @ApiProperty({ example: 'NewSecret123!', minLength: 8, description: 'New password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword!: string;
}
