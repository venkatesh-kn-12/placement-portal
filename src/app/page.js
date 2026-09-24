'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';

export default function Home() {
  const router = useRouter();
  const { user, role, mounted } = useAuth();

  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      router.push('/login');
    } else if (role === 'ADMIN') {
      router.push('/admin');
    } else if (role === 'FACULTY') {
      router.push('/faculty');
    } else {
      router.push('/dashboard');
    }
  }, [mounted, user, role, router]);

  return null;
}
