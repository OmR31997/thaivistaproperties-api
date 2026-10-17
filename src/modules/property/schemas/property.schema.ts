import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  BEDROOM_OPTIONS,
  PROPERTY_TYPES,
} from '@modules/property-inquiry/constants/property-inquiry.constants';
import {
  BATHROOM_OPTIONS,
  PROPERTY_INTENTS,
} from '@modules/property/constants/property.constants';

export type PropertyDocument = HydratedDocument<Property>;

@Schema({ timestamps: true, versionKey: false, collection: 'properties' })
export class Property {
  @Prop({ type: String, required: true, trim: true, maxlength: 100 })
  name!: string;

  @Prop({ type: String, trim: true, maxlength: 30 })
  phone?: string;

  @Prop({ type: String, trim: true, lowercase: true, maxlength: 254 })
  email?: string;

  @Prop({ type: String, trim: true, maxlength: 100 })
  lineId?: string;

  @Prop({ type: String, enum: PROPERTY_INTENTS, required: true, index: true })
  intent!: (typeof PROPERTY_INTENTS)[number];

  @Prop({ type: String, enum: PROPERTY_TYPES, required: true, index: true })
  propertyType!: (typeof PROPERTY_TYPES)[number];

  @Prop({ type: String, required: true, trim: true, maxlength: 200 })
  buildingName!: string;

  @Prop({ type: String, enum: BEDROOM_OPTIONS, required: true })
  bedrooms!: (typeof BEDROOM_OPTIONS)[number];

  @Prop({ type: String, enum: BATHROOM_OPTIONS, required: true })
  bathrooms!: (typeof BATHROOM_OPTIONS)[number];

  @Prop({ type: String, required: true, trim: true })
  sizeSQM!: string;

  @Prop({ type: String, required: true, trim: true })
  price!: string;

  @Prop({ type: String, trim: true, maxlength: 2000, default: '' })
  message!: string;

  @Prop({ type: [String], default: [] })
  photoPaths!: string[];
}

export const PropertySchema = SchemaFactory.createForClass(Property);

PropertySchema.index({ createdAt: -1 });
PropertySchema.index({ intent: 1, propertyType: 1 });
