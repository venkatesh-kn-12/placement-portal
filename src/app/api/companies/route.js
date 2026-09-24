import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET() {
  return NextResponse.json(db.companies);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const newCompany = {
      companyId: `comp-${Date.now()}`,
      name: body.name,
      role: body.role,
      logo: body.logo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100',
      ctc: body.ctc,
      location: body.location || 'Pan India',
      minCgpa: Number(body.minCgpa) || 7.0,
      requiredCodingScore: Number(body.requiredCodingScore) || 75,
      deadline: body.deadline || '2026-12-31',
      status: 'OPEN',
      skills: body.skills ? body.skills.split(',').map(s => s.trim()) : ['Algorithms', 'Data Structures'],
      eligibilityMatch: 85,
      applicationStatus: 'Eligible - Ready to Apply'
    };
    db.companies.unshift(newCompany);
    return NextResponse.json(newCompany);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add company' }, { status: 400 });
  }
}
