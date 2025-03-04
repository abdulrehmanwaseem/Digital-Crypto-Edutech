import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { PERMISSIONS, type UserSession, type Permission } from '@/types/auth';
import { Role } from '@prisma/client';

export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return null;
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || 'your-secret-key') as UserSession;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function hasPermission(userRole: Role, requiredPermission: Permission): boolean {
  const roleKey = userRole.toString() as keyof typeof PERMISSIONS;
  const userPermissions = PERMISSIONS[roleKey];
  return userPermissions?.includes(requiredPermission) || false;
}

export function requirePermission(permission: Permission) {
  return async function middleware(request: Request) {
    const session = await getSession();
    
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    if (!hasPermission(session.role, permission)) {
      return new Response('Forbidden', { status: 403 });
    }

    return null; // Continue to the handler
  };
}
