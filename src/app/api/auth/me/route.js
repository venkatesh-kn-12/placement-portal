import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { db } from '@/lib/store';

export async function GET(request) {
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if (!error && data && data.length > 0) {
      return NextResponse.json(data[0]);
    }
  } catch (err) {
    console.warn('Supabase users fallback:', err.message);
  }
  return NextResponse.json(db.users[0]);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const formattedEmail = body.email?.toLowerCase().trim();

    // Check Supabase first
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('email', formattedEmail)
        .maybeSingle();

      if (data) return NextResponse.json(data);

      const newUser = {
        email: formattedEmail,
        fullName: body.fullName || formattedEmail.split('@')[0],
        role: body.role || 'STUDENT',
        department: 'Computer Science & Engineering',
        cgpa: 8.5
      };

      const { data: inserted, error } = await supabase.from('users').insert([newUser]).select().single();
      if (!error && inserted) return NextResponse.json(inserted);
    } catch (sbErr) {
      console.warn('Supabase insert failed, using fallback:', sbErr.message);
    }

    // Fallback store
    const existing = db.users.find(u => u.email.toLowerCase() === formattedEmail);
    if (existing) return NextResponse.json(existing);

    const fallbackUser = {
      id: `u-${Date.now()}`,
      email: formattedEmail,
      fullName: body.fullName || formattedEmail.split('@')[0],
      role: body.role || 'STUDENT',
      department: 'Computer Science & Engineering',
      cgpa: 8.5
    };
    db.users.push(fallbackUser);
    return NextResponse.json(fallbackUser);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to sync user' }, { status: 400 });
  }
}
