import { Role } from '@prisma/client';

export interface UserSession {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export interface AuthResponse {
  message: string;
  user?: UserSession;
  error?: string;
}

export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN'
} as const;

export type Permission = 'read:profile' | 'edit:profile' | 'read:courses' | 'enroll:courses' | 'manage:courses' | 'manage:users' | 'manage:plans';

export const PERMISSIONS: Record<keyof typeof ROLES, Permission[]> = {
  [ROLES.USER]: ['read:profile', 'edit:profile', 'read:courses', 'enroll:courses'],
  [ROLES.ADMIN]: ['read:profile', 'edit:profile', 'read:courses', 'enroll:courses', 'manage:courses', 'manage:users', 'manage:plans']
};
