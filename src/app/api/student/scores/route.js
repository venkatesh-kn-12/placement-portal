import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET() {
  return NextResponse.json(db.scores);
}

export async function POST(request) {
  try {
    const body = await request.json();
    db.scores = {
      ...db.scores,
      ...body,
      readiness_score: Math.round(
        ((body.soft_skills || db.scores.soft_skills) +
         (body.aptitude || db.scores.aptitude) +
         (body.coding || db.scores.coding)) / 3
      )
    };
    return NextResponse.json(db.scores);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update scores' }, { status: 400 });
  }
}
