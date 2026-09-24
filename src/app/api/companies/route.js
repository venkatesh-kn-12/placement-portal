import { NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { verifyRole } from '@/lib/serverAuth';

export async function GET() {
  return NextResponse.json(db.companies);
}

export async function POST(request) {
  // Only ADMIN can create campus recruitment drives
  const auth = await verifyRole(request, ['ADMIN']);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    if (!body.name || !body.role) {
      return NextResponse.json({ error: 'Company name and role are required' }, { status: 400 });
    }

    const newCompany = {
      companyId: `comp-${Date.now()}`,
      name: body.name.trim(),
      role: body.role.trim(),
      logo: body.logo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100',
      ctc: body.ctc || '12.0 LPA',
      location: body.location || 'Bengaluru / Pan India',
      minCgpa: Number(body.minCgpa) || 7.0,
      requiredCodingScore: Number(body.requiredCodingScore) || 75,
      deadline: body.deadline || '2026-12-31',
      status: 'OPEN',
      skills: body.skills ? (Array.isArray(body.skills) ? body.skills : body.skills.split(',').map(s => s.trim())) : ['Algorithms', 'Data Structures'],
      eligibilityMatch: 85,
      applicationStatus: 'Eligible - Ready to Apply'
    };
    db.companies.unshift(newCompany);
    return NextResponse.json(newCompany);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add company' }, { status: 400 });
  }
}
