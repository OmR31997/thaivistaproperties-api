import { BedroomOption, PropertyType } from "@modules/property-inquiry/types/property-inquiry.types";
import { BathroomOption, PropertyIntent, PropertyStatus } from "../constants/property.constants";

export class Property {
  name!: string;

  phone?: string;

  email?: string;

  lineId?: string;

  intent!: PropertyIntent;

  propertyType!: PropertyType;

  buildingName?: string;

  bedrooms?: BedroomOption;

  bathrooms?: BathroomOption;

  sizeSQM?: number;

  price!: number;

  status?: PropertyStatus;

  message?: string;

  photoPaths?: string[];
}
