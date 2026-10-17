import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType,
} from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  BEDROOM_OPTIONS,
  PROPERTY_TYPES,
} from '@modules/property-inquiry/constants/property-inquiry.constants';
import {
  BATHROOM_OPTIONS,
  PROPERTY_INTENTS,
} from '@modules/property/constants/property.constants';
import { BaseQueryDto } from '@common/dto/base-query.dto';

export class CreatePropertyDto {
  @ApiProperty({ maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ maxLength: 30 })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ maxLength: 254 })
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lineId?: string;

  @ApiProperty({ enum: PROPERTY_INTENTS })
  @IsIn(PROPERTY_INTENTS)
  intent!: (typeof PROPERTY_INTENTS)[number];

  @ApiProperty({ enum: PROPERTY_TYPES })
  @IsIn(PROPERTY_TYPES)
  propertyType!: (typeof PROPERTY_TYPES)[number];

  @ApiProperty({ maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  buildingName!: string;

  @ApiProperty({ enum: BEDROOM_OPTIONS })
  @IsIn(BEDROOM_OPTIONS)
  bedrooms!: (typeof BEDROOM_OPTIONS)[number];

  @ApiProperty({ enum: BATHROOM_OPTIONS })
  @IsIn(BATHROOM_OPTIONS)
  bathrooms!: (typeof BATHROOM_OPTIONS)[number];

  @ApiProperty({ example: '120 sqm' })
  @IsString()
  @IsNotEmpty()
  sizeSQM!: string;

  @ApiProperty({ example: '฿12,000,000' })
  @IsString()
  @IsNotEmpty()
  price!: string;

  @ApiPropertyOptional({ maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;

  @ApiPropertyOptional({ type: [String], description: 'Extensionless media relative paths' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photoPaths?: string[];
}

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {}

export class PropertyQueryDto extends BaseQueryDto {
  @ApiPropertyOptional({ enum: PROPERTY_INTENTS })
  @IsOptional()
  @IsIn(PROPERTY_INTENTS)
  intent?: (typeof PROPERTY_INTENTS)[number];

  @ApiPropertyOptional({ enum: PROPERTY_TYPES })
  @IsOptional()
  @IsIn(PROPERTY_TYPES)
  propertyType?: (typeof PROPERTY_TYPES)[number];

  @ApiPropertyOptional({ enum: BEDROOM_OPTIONS })
  @IsOptional()
  @IsIn(BEDROOM_OPTIONS)
  bedrooms?: (typeof BEDROOM_OPTIONS)[number];

  @ApiPropertyOptional({ enum: BATHROOM_OPTIONS })
  @IsOptional()
  @IsIn(BATHROOM_OPTIONS)
  bathrooms?: (typeof BATHROOM_OPTIONS)[number];
}

export class PropertyPaginationMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 5 })
  totalPages!: number;

  @ApiProperty({ example: true })
  hasNextPage!: boolean;

  @ApiProperty({ example: false })
  hasPreviousPage!: boolean;
}

export class PaginatedPropertyResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'Success' })
  message!: string;

  @ApiProperty({ type: [CreatePropertyDto] })
  data!: CreatePropertyDto[];

  @ApiProperty({ type: PropertyPaginationMetaDto })
  meta!: PropertyPaginationMetaDto;
}
