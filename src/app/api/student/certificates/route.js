import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET() {
  return NextResponse.json(db.certificates);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const newCert = {
      id: `c-${Date.now()}`,
      studentName: 'Vamshi Krishna',
      studentUsn: '1DS21CS108',
      name: body.name,
      issuer: body.issuer,
      issueDate: body.issueDate || new Date().toISOString().split('T')[0],
      credentialId: body.credentialId || `ID-${Math.floor(Math.random() * 89999 + 10000)}`,
      status: 'PENDING',
      evidenceUrl: body.evidenceUrl || ''
    };
    db.certificates.unshift(newCert);
    return NextResponse.json(newCert);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add certificate' }, { status: 400 });
  }
}
