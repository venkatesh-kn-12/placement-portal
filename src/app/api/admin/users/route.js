import { NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { verifyRole } from '@/lib/serverAuth';

export async function GET(request) {
  const auth = await verifyRole(request, ['ADMIN']);
  if (!auth.authorized) return auth.response;

  return NextResponse.json(db.users);
}

export async function PUT(request) {
  const auth = await verifyRole(request, ['ADMIN']);
  if (!auth.authorized) return auth.response;

  try {
    const { userId, role } = await request.json();
    const target = db.users.find(u => u.id === userId);
    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Protect master admin from being demoted
    if (target.id === 'master-admin-01' || target.email === 'admin@portal.com' || target.role === 'ADMIN' && target.email?.includes('admin')) {
      if (role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Permanent Master Admin role cannot be modified' },
          { status: 403 }
        );
      }
    }

    target.role = role;
    return NextResponse.json(target);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 400 });
  }
}

export async function DELETE(request) {
  const auth = await verifyRole(request, ['ADMIN']);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    // Protect master admin from deletion
    if (userId === 'master-admin-01') {
      return NextResponse.json(
        { error: 'Permanent Master Admin cannot be deleted' },
        { status: 403 }
      );
    }

    const index = db.users.findIndex(u => u.id === userId);
    if (index !== -1) {
      if (db.users[index].id === 'master-admin-01' || db.users[index].email === 'admin@portal.com') {
        return NextResponse.json(
          { error: 'Permanent Master Admin cannot be deleted' },
          { status: 403 }
        );
      }
      db.users.splice(index, 1);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 400 });
  }
}
