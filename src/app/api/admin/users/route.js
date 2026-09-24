import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET() {
  return NextResponse.json(db.users);
}

export async function PUT(request) {
  try {
    const { userId, role } = await request.json();
    const target = db.users.find(u => u.id === userId);
    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    target.role = role;
    return NextResponse.json(target);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 400 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    const index = db.users.findIndex(u => u.id === userId);
    if (index !== -1) {
      db.users.splice(index, 1);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 400 });
  }
}
