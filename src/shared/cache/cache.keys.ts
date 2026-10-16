function createCacheKey(module: string, resource: string, id: string): string {
  const segments = [module, resource, id].map((segment) => segment.trim());
  if (segments.some((segment) => segment.length === 0 || segment.includes(':'))) {
    throw new Error('Cache key segments must be non-empty and must not contain ":"');
  }
  return segments.join(':');
}

export const CacheKeys = {
  user: (id: string) => createCacheKey('users', 'user', id),
  propertyInquiry: (id: string) => createCacheKey('property-inquiries', 'property-inquiry', id),
} as const;
