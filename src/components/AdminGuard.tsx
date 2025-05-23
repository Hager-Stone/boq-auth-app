'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { app } from '@/firebase/clientApp';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email === 'global@hagerstone.com') {
        setAuthorized(true);
      } else {
        router.push('/unauthorized'); // fallback page
      }
    });

    return () => unsubscribe();
  }, []);

  if (!authorized) {
    return <div className="p-6 text-center text-gray-500">Checking admin access...</div>;
  }

  return <>{children}</>;
}
