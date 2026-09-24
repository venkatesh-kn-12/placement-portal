import { NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { verifyRole } from '@/lib/serverAuth';

export async function GET(request) {
  const auth = await verifyRole(request, ['FACULTY', 'ADMIN']);
  if (!auth.authorized) return auth.response;

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
