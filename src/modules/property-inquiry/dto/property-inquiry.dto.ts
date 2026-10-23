import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
} from 'class-validator';
import { BaseQueryDto } from '@common/dto/base-query.dto';
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
  @ApiPropertyOptional({ enum: PROPERTY_INQUIRY_INTENT, default: 'contact' })
  @IsOptional()
  @IsIn(PROPERTY_INQUIRY_INTENT)
  intent?: (typeof PROPERTY_INQUIRY_INTENT)[number];

  @ApiPropertyOptional({ enum: PROPERTY_TYPES, nullable: true })
  @IsOptional()
  @IsIn(PROPERTY_TYPES)
  propertyType?: (typeof PROPERTY_TYPES)[number] | null;

  @ApiPropertyOptional({ enum: PREFERRED_AREAS, nullable: true })
  @IsOptional()
  @IsIn(PREFERRED_AREAS)
  preferredArea?: (typeof PREFERRED_AREAS)[number] | null;

  @ApiPropertyOptional({ enum: PROPERTY_BUDGETS, nullable: true })
  @IsOptional()
  @IsIn(PROPERTY_BUDGETS)
  budget?: (typeof PROPERTY_BUDGETS)[number] | null;

  @ApiPropertyOptional({ enum: BEDROOM_OPTIONS, nullable: true })
  @IsOptional()
  @IsIn(BEDROOM_OPTIONS)
  bedrooms?: (typeof BEDROOM_OPTIONS)[number] | null;

  @ApiPropertyOptional({ enum: INQUIRY_TIMELINES, nullable: true })
  @IsOptional()
  @IsIn(INQUIRY_TIMELINES)
  timeline?: (typeof INQUIRY_TIMELINES)[number] | null;

  @ApiProperty({ type: PropertyInquiryContactDto })
  @ValidateNested()
  @Type(() => PropertyInquiryContactDto)
  contact!: PropertyInquiryContactDto;

  @ApiPropertyOptional({ enum: PROPERTY_INQUIRY_STATUSES, default: 'pending' })
  @IsOptional()
  @IsIn(PROPERTY_INQUIRY_STATUSES)
  status?: (typeof PROPERTY_INQUIRY_STATUSES)[number];

  @ApiPropertyOptional({ maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;
}

export class UpdatePropertyInquiryDto extends PartialType(CreatePropertyInquiryDto) {}

export class PropertyInquiryQueryDto extends BaseQueryDto {
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
