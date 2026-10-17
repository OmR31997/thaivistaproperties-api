
export const PROPERTY_INTENTS = ['sell', 'rentOut'] as const;

export const BATHROOM_OPTIONS = [
  '1',
  '2',
  '3',
  '4',
  '5+',
] as const;

export type PropertyIntent = (typeof PROPERTY_INTENTS)[number];
export type BathroomOption = (typeof BATHROOM_OPTIONS)[number];