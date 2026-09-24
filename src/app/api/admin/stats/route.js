import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET() {
  return NextResponse.json({
    ...db.adminStats,
    registeredUsersCount: db.users.length,
    activeCompaniesCount: db.companies.length,
    totalProjectsCount: db.projects.length,
    pendingReviewCount: db.projects.filter(p => p.status === 'PENDING').length + db.certificates.filter(c => c.status === 'PENDING').length
  });
}
