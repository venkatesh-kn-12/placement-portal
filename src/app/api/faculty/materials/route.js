import { NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { verifyRole } from '@/lib/serverAuth';

export async function GET() {
  return NextResponse.json(db.materials);
}

export async function POST(request) {
  const auth = await verifyRole(request, ['FACULTY', 'ADMIN']);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    if (!body.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const newMaterial = {
      id: `mat-${Date.now()}`,
      title: body.title.trim(),
      category: body.category || 'General Placement',
      format: body.format || 'PDF',
      author: body.author || 'Faculty Mentor',
      downloads: 0,
      dateAdded: new Date().toISOString().split('T')[0]
    };
    db.materials.unshift(newMaterial);
    return NextResponse.json(newMaterial);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload material' }, { status: 400 });
  }
}
