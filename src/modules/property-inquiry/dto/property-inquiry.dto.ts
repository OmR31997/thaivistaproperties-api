import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
} from 'class-validator';
import {
  BEDROOM_OPTIONS,
  INQUIRY_TIMELINES,
  PREFERRED_AREAS,
  PROPERTY_BUDGETS,
  PROPERTY_INQUIRY_INTENT,
  PROPERTY_INQUIRY_STATUSES,
  PROPERTY_TYPES,
} from '@modules/property-inquiry/constants/property-inquiry.constants';

export class PropertyInquiryContactDto {
  @ApiProperty({ maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ maxLength: 30, description: 'Provide phone or email' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phoneWhatsApp?: string;

  @ApiPropertyOptional({ description: 'Provide email or phone' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ type: String, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lineId?: string;
}

@ValidatorConstraint({ name: 'contactMethodRequired', async: false })
class ContactMethodRequiredConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments): boolean {
    const contact = args.object as PropertyInquiryContactDto;
    return Boolean(contact.email?.trim() || contact.phoneWhatsApp?.trim());
  }

  defaultMessage(): string {
    return 'Either email or phoneWhatsApp is required';
  }
}

function HasContactMethod(): PropertyDecorator {
  return (target, propertyKey) => {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyKey as string,
      validator: ContactMethodRequiredConstraint,
    });
  };
}

HasContactMethod()(PropertyInquiryContactDto.prototype, 'email');

export class CreatePropertyInquiryDto {
  @ApiProperty({ enum: PROPERTY_INQUIRY_INTENT })
  @IsIn(PROPERTY_INQUIRY_INTENT)
  intent!: (typeof PROPERTY_INQUIRY_INTENT)[number];

  @ApiProperty({ enum: PROPERTY_TYPES })
  @IsIn(PROPERTY_TYPES)
  propertyType!: (typeof PROPERTY_TYPES)[number];

  @ApiProperty({ enum: PREFERRED_AREAS })
  @IsIn(PREFERRED_AREAS)
  preferredArea!: (typeof PREFERRED_AREAS)[number];

  @ApiProperty({ enum: PROPERTY_BUDGETS })
  @IsIn(PROPERTY_BUDGETS)
  budget!: (typeof PROPERTY_BUDGETS)[number];

  @ApiPropertyOptional({ enum: BEDROOM_OPTIONS, nullable: true })
  @IsOptional()
  @IsIn(BEDROOM_OPTIONS)
  bedrooms?: (typeof BEDROOM_OPTIONS)[number] | null;

  @ApiProperty({ enum: INQUIRY_TIMELINES })
  @IsIn(INQUIRY_TIMELINES)
  timeline!: (typeof INQUIRY_TIMELINES)[number];

  @ApiProperty({ type: PropertyInquiryContactDto })
  @ValidateNested()
  @Type(() => PropertyInquiryContactDto)
  contact!: PropertyInquiryContactDto;

  @ApiPropertyOptional({ maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;
}

export class UpdatePropertyInquiryDto extends PartialType(CreatePropertyInquiryDto) {
  @ApiPropertyOptional({ enum: PROPERTY_INQUIRY_STATUSES })
  @IsOptional()
  @IsIn(PROPERTY_INQUIRY_STATUSES)
  status?: (typeof PROPERTY_INQUIRY_STATUSES)[number];
}

export class PropertyInquiryQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;

  @ApiPropertyOptional({ description: 'Search name, email, phone, or message' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: PROPERTY_INQUIRY_INTENT })
  @IsOptional()
  @IsIn(PROPERTY_INQUIRY_INTENT)
  intent?: (typeof PROPERTY_INQUIRY_INTENT)[number];

  @ApiPropertyOptional({ enum: PROPERTY_TYPES })
  @IsOptional()
  @IsIn(PROPERTY_TYPES)
  propertyType?: (typeof PROPERTY_TYPES)[number];

  @ApiPropertyOptional({ enum: PREFERRED_AREAS })
  @IsOptional()
  @IsIn(PREFERRED_AREAS)
  preferredArea?: (typeof PREFERRED_AREAS)[number];

  @ApiPropertyOptional({ enum: PROPERTY_INQUIRY_STATUSES })
  @IsOptional()
  @IsIn(PROPERTY_INQUIRY_STATUSES)
  status?: (typeof PROPERTY_INQUIRY_STATUSES)[number];
}
