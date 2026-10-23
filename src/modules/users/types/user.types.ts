export const USER_ROLES = ['Agent', 'Sub Admin', 'Super Admin'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const AGENT_ROLE: UserRole = 'Agent';
export const SUB_ADMIN_ROLE: UserRole = 'Sub Admin';
export const SUPER_ADMIN_ROLE: UserRole = 'Super Admin';
