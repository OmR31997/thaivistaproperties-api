import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { AGENT_ROLE, USER_ROLES } from '@modules/users/types/user.types';
import type { UserRole } from '@modules/users/types/user.types';

export class SignupDto {
  @ApiProperty({ example: 'agent@thaivista.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Agent@123', minLength: 8 })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({ enum: USER_ROLES, default: AGENT_ROLE })
  @IsOptional()
  @IsIn(USER_ROLES)
  role: UserRole = AGENT_ROLE;
}
