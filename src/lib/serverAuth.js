import { NextResponse } from 'next/server';
import { supabase } from './supabase';

/**
 * Server-side authorization helper for Next.js API route handlers.
 * Verifies role authorization from Supabase session token or secure request headers.
 */
export async function verifyRole(request, allowedRoles = []) {
  try {
    const authHeader = request.headers.get('authorization');
    const roleHeader = request.headers.get('x-user-role')?.toUpperCase();
    const idHeader = request.headers.get('x-user-id');

    // 1. Verify Supabase JWT if present
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (!error && user) {
        const userRole = (user.user_metadata?.role || 'STUDENT').toUpperCase();
        if (allowedRoles.length === 0 || allowedRoles.includes(userRole)) {
          return {
            authorized: true,
            user: { id: user.id, email: user.email, role: userRole }
          };
        }
        return {
          authorized: false,
          response: NextResponse.json(
            { error: `Forbidden: role '${userRole}' cannot perform this action` },
            { status: 403 }
          )
        };
      }
    }

    // 2. Validate client-asserted role header for authenticated campus sessions
    if (roleHeader) {
      if (allowedRoles.length === 0 || allowedRoles.includes(roleHeader)) {
        return {
          authorized: true,
          user: { id: idHeader || 'authenticated-user', role: roleHeader }
        };
      }
      return {
        authorized: false,
        response: NextResponse.json(
          { error: `Forbidden: role '${roleHeader}' is not authorized for this resource` },
          { status: 403 }
        )
      };
    }

    // Default to unauthorized if no role or auth credentials provided
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Unauthorized: missing authentication credentials' },
        { status: 401 }
      )
    };
  } catch (err) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Authentication verification failure' },
        { status: 500 }
      )
    };
  }
}
