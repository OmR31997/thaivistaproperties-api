import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsNotEmpty()
  @IsString()
  MONGODB_URI!: string;

  @IsNotEmpty()
  @IsString()
  DEFAULT_ADMIN_EMAIL!: string;

  @IsNotEmpty()
  @IsString()
  DEFAULT_ADMIN_PASSWORD!: string;

  @IsNotEmpty()
  @IsString()
  JWT_SECRET!: string;

  @IsOptional()
  @IsString()
  JWT_ACCESS_EXPIRES_IN?: string;

  @IsOptional()
  @IsString()
  JWT_REFRESH_EXPIRES_IN?: string;
}

export function validateEnvironment(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: false,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(`Environment validation failed: ${errors.toString()}`);
  }
  return validated;
}
