import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET() {
  return NextResponse.json(db.projects);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const newProject = {
      id: `p-${Date.now()}`,
      studentName: 'Vamshi Krishna',
      studentUsn: '1DS21CS108',
      title: body.title,
      description: body.description,
      techStack: body.techStack,
      liveUrl: body.liveUrl || '',
      githubUrl: body.githubUrl || '',
      status: 'PENDING',
      feedback: 'Submitted and queued for faculty review'
    };
    db.projects.unshift(newProject);
    return NextResponse.json(newProject);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add project' }, { status: 400 });
  }
}
