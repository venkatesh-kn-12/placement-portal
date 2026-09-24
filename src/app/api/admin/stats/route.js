import { NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { verifyRole } from '@/lib/serverAuth';

export async function GET(request) {
  const auth = await verifyRole(request, ['ADMIN']);
  if (!auth.authorized) return auth.response;

  return NextResponse.json({
    ...db.adminStats,
    registeredUsersCount: db.users.length,
    activeCompaniesCount: db.companies.length,
    totalProjectsCount: db.projects.length,
    pendingReviewCount: db.projects.filter(p => p.status === 'PENDING').length + db.certificates.filter(c => c.status === 'PENDING').length
  });
}
