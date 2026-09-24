import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET() {
  return NextResponse.json(db.materials);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const newMaterial = {
      id: `mat-${Date.now()}`,
      title: body.title,
      category: body.category || 'General Placement',
      format: body.format || 'PDF',
      author: body.author || 'Faculty Member',
      downloads: 0,
      dateAdded: new Date().toISOString().split('T')[0]
    };
    db.materials.unshift(newMaterial);
    return NextResponse.json(newMaterial);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload material' }, { status: 400 });
  }
}
