
import {
  PROPERTY_INQUIRY_INTENT,
  PROPERTY_TYPES,
  PREFERRED_AREAS,
  PROPERTY_BUDGETS,
  BEDROOM_OPTIONS,
  INQUIRY_TIMELINES,
  PROPERTY_INQUIRY_STATUSES,
} from "@modules/property-inquiry/constants/property-inquiry.constants";

export type PropertyInquiryIntent =
  (typeof PROPERTY_INQUIRY_INTENT)[number];

export type PropertyType =
  (typeof PROPERTY_TYPES)[number];

export type PreferredArea =
  (typeof PREFERRED_AREAS)[number];

export type PropertyBudget =
  (typeof PROPERTY_BUDGETS)[number];

export type BedroomOption =
  (typeof BEDROOM_OPTIONS)[number];

export type InquiryTimeline =
  (typeof INQUIRY_TIMELINES)[number];

export type PropertyInquiryStatus =
  (typeof PROPERTY_INQUIRY_STATUSES)[number];

export interface PropertyInquiryContact {
  name: string;
  phoneWhatsApp?: string;
  email?: string;
  lineId?: string;
}

export interface CreatePropertyInquiryInput {
  intent?: PropertyInquiryIntent;
  propertyType?: PropertyType | null;
  preferredArea?: PreferredArea | null;
  budget?: PropertyBudget | null;
  bedrooms?: BedroomOption | null;
  timeline?: InquiryTimeline | null;
  contact: PropertyInquiryContact;
  status?: PropertyInquiryStatus;
  message?: string;
}

export interface PropertyInquiryDocument
  extends CreatePropertyInquiryInput {
  status: PropertyInquiryStatus;
  createdAt: Date;
  updatedAt: Date;
}
