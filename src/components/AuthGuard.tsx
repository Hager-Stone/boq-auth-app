'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { app } from '@/firebase/clientApp';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
    const db = getFirestore(app);

    let unsubscribeDoc: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user?.email) {
        router.push('/login');
        return;
      }

      const email = user.email;

      if (email.endsWith('@hagerstone.com')) {
        setAuthorized(true);
        return;
      }

      const docRef = doc(db, 'access_requests', email);

      unsubscribeDoc = onSnapshot(docRef, (docSnap) => {
        if (!docSnap.exists()) {
          router.push(`/request-access?email=${email}`);
          return;
        }

        const status = docSnap.data().status;

        if (status === 'approved') {
          setAuthorized(true);
        } else if (status === 'rejected') {
          router.push('/unauthorized');
        } else {
          router.push(`/request-access?email=${email}`);
        }
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, [router]); // ✅ Add router to dependency array

  if (!authorized) return null;

  return <>{children}</>;
}
