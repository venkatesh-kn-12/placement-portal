import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET() {
  const students = db.users
    .filter(u => u.role === 'STUDENT')
    .map(s => ({
      ...s,
      scores: db.scores,
      verifiedProjects: db.projects.filter(p => p.studentName === s.fullName && p.status === 'APPROVED').length,
      pendingProjects: db.projects.filter(p => p.studentName === s.fullName && p.status === 'PENDING').length,
      approvedCerts: db.certificates.filter(c => c.studentName === s.fullName && c.status === 'APPROVED').length
    }));
  return NextResponse.json(students);
}
