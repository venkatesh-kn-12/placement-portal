import { NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { verifyRole } from '@/lib/serverAuth';

export async function GET(request) {
  const auth = await verifyRole(request, ['FACULTY', 'ADMIN']);
  if (!auth.authorized) return auth.response;

  const pendingProjects = db.projects.filter(p => p.status === 'PENDING').map(p => ({ ...p, type: 'PROJECT' }));
  const pendingCerts = db.certificates.filter(c => c.status === 'PENDING').map(c => ({ ...c, type: 'CERTIFICATE' }));
  return NextResponse.json({
    projects: pendingProjects,
    certificates: pendingCerts,
    totalPending: pendingProjects.length + pendingCerts.length
  });
}

export async function POST(request) {
  // Only Faculty or Admin can approve/reject student evidence
  const auth = await verifyRole(request, ['FACULTY', 'ADMIN']);
  if (!auth.authorized) return auth.response;

  try {
    const { id, type, status, feedback } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing required review parameters' }, { status: 400 });
    }

    if (type === 'PROJECT') {
      const proj = db.projects.find(p => p.id === id);
      if (proj) {
        proj.status = status; // 'APPROVED' or 'REJECTED'
        proj.feedback = feedback || (status === 'APPROVED' ? 'Verified by Faculty' : 'Changes requested');
      }
    } else {
      const cert = db.certificates.find(c => c.id === id);
      if (cert) {
        cert.status = status;
      }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update review' }, { status: 400 });
  }
}
