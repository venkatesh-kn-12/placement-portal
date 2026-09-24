import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { db } from '@/lib/store';

export async function GET() {
  try {
    const { data, error } = await supabase.from('courses').select('*');
    if (!error && data && data.length > 0) {
      return NextResponse.json(data);
    }
  } catch (err) {
    console.warn('Supabase courses query failed:', err.message);
  }
  return NextResponse.json(db.courses);
}

export async function POST(request) {
  try {
    const { courseId, lessonId } = await request.json();
    const course = db.courses.find(c => c.id === courseId);
    if (course) {
      const lesson = course.lessons.find(l => l.id === lessonId);
      if (lesson) {
        lesson.completed = !lesson.completed;
      }
      const completedCount = course.lessons.filter(l => l.completed).length;
      course.completedLessons = completedCount;
      course.progress = Math.round((completedCount / course.lessons.length) * 100);

      // Attempt sync to Supabase
      try {
        await supabase.from('courses').upsert({ id: course.id, ...course });
      } catch (e) {}
    }
    return NextResponse.json(db.courses);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update lesson' }, { status: 400 });
  }
}
