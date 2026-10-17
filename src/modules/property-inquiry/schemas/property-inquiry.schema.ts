import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  BEDROOM_OPTIONS,
  INQUIRY_TIMELINES,
  PREFERRED_AREAS,
  PROPERTY_BUDGETS,
  PROPERTY_INQUIRY_INTENT,
  PROPERTY_INQUIRY_STATUSES,
  PROPERTY_TYPES,
} from '@modules/property-inquiry/constants/property-inquiry.constants';

export type PropertyInquiryDocument = HydratedDocument<PropertyInquiry>;

@Schema({ _id: false })
export class PropertyInquiryContact {
  @Prop({ required: true, trim: true, maxlength: 100 })
  name!: string;

  @Prop({
    type: String,
    trim: true,
    maxlength: 30,
    required: function (this: PropertyInquiryContact) {
      return !this.email;
    },
  })
  phoneWhatsApp?: string;

  @Prop({
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 254,
    required: function (this: PropertyInquiryContact) {
      return !this.phoneWhatsApp;
    },
  })
  email?: string;

  @Prop({ type: String, trim: true, maxlength: 100 })
  lineId?: string;
}

export const PropertyInquiryContactSchema =
  SchemaFactory.createForClass(PropertyInquiryContact);

@Schema({ timestamps: true, versionKey: false, collection: 'property-inquiries' })
export class PropertyInquiry {
  @Prop({ type: String, enum: PROPERTY_INQUIRY_INTENT, required: true, index: true })
  intent!: (typeof PROPERTY_INQUIRY_INTENT)[number];

  @Prop({ type: String, enum: PROPERTY_TYPES, required: true })
  propertyType!: (typeof PROPERTY_TYPES)[number];

  @Prop({ type: String, enum: PREFERRED_AREAS, required: true })
  preferredArea!: (typeof PREFERRED_AREAS)[number];

  @Prop({ type: String, enum: PROPERTY_BUDGETS, required: true })
  budget!: (typeof PROPERTY_BUDGETS)[number];

  @Prop({ type: String, enum: BEDROOM_OPTIONS, default: null })
  bedrooms?: (typeof BEDROOM_OPTIONS)[number] | null;

  @Prop({ type: String, enum: INQUIRY_TIMELINES, required: true })
  timeline!: (typeof INQUIRY_TIMELINES)[number];

  @Prop({ type: PropertyInquiryContactSchema, required: true })
  contact!: PropertyInquiryContact;

  @Prop({ type: String, trim: true, maxlength: 2000, default: '' })
  message!: string;

  @Prop({ type: String, enum: PROPERTY_INQUIRY_STATUSES, default: 'new', index: true })
  status!: (typeof PROPERTY_INQUIRY_STATUSES)[number];
}

export const PropertyInquirySchema = SchemaFactory.createForClass(PropertyInquiry);

PropertyInquirySchema.index({ createdAt: -1 });
PropertyInquirySchema.index({ intent: 1, propertyType: 1 });
