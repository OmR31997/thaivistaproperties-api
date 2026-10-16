import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PropertyInquiry,
  PropertyInquirySchema,
} from '@modules/property-inquiry/schemas/property-inquiry.schema';
import { PropertyInquiryController } from '@modules/property-inquiry/property-inquiry.controller';
import { PropertyInquiryRepository } from '@modules/property-inquiry/property-inquiry.repository';
import { PropertyInquiryService } from '@modules/property-inquiry/property-inquiry.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PropertyInquiry.name, schema: PropertyInquirySchema },
    ]),
  ],
  controllers: [PropertyInquiryController],
  providers: [PropertyInquiryRepository, PropertyInquiryService],
  exports: [PropertyInquiryService],
})
export class PropertyInquiryModule {}
