
export const PROPERTY_INQUIRY_INTENT = [
  "buy",
  "rent",
  "invest",
] as const;

export const PROPERTY_TYPES = [
  "condo",
  "house",
  "villa",
  "land",
  "commercial",
] as const;

export const PREFERRED_AREAS = [
  "naklua",
  "wongamat",
  "central-pattaya",
  "pratumnak",
  "jomtien",
  "east-pattaya",
  "other",
] as const;

export const PROPERTY_BUDGETS = [
  "under-3m",
  "3m-6m",
  "6m-10m",
  "10m-20m",
  "over-20m",
] as const;

export const BEDROOM_OPTIONS = [
  "studio",
  "1",
  "2",
  "3",
  "4",
  "5-plus",
] as const;

export const INQUIRY_TIMELINES = [
  "asap",
  "within-1-month",
  "1-3-months",
  "3-6-months",
  "browsing",
] as const;

export const PROPERTY_INQUIRY_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "closed",
  "spam",
] as const;

export type PropertyIntent = (typeof PROPERTY_INQUIRY_INTENT)[number];
export type PropertyType = (typeof PROPERTY_TYPES)[number];
export type BedroomOption = (typeof BEDROOM_OPTIONS)[number];