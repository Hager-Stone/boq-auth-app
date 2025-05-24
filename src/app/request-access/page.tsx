'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '@/firebase/clientApp';

export default function RequestAccessPage() {
  const db = getFirestore(app);
  const auth = getAuth(app);
  const router = useRouter();

  const [email, setEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user?.email) {
        router.push('/login');
        return;
      }

      const userEmail = user.email;
      setEmail(userEmail);

      const docRef = doc(db, 'access_requests', userEmail);

      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          email: userEmail,
          status: 'pending',
          requestedAt: new Date().toISOString(),
        });
      } else {
        setStatus(docSnap.data().status);
      }

      // Real-time updates
      const unsubscribeDoc = onSnapshot(docRef, (snap) => {
        if (snap.exists()) {
          const newStatus = snap.data().status;
          setStatus(newStatus);

          if (newStatus === 'approved') {
            router.push('/boq');
          } else if (newStatus === 'rejected') {
            router.push('/unauthorized');
          }
        }
      });

      // Cleanup
      return () => unsubscribeDoc();
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-yellow-50">
      <div className="bg-white p-6 shadow rounded text-center max-w-md">
        <h2 className="text-xl font-semibold mb-4">Access Request Submitted</h2>
        <p className="text-gray-700 mb-2">
          <strong>{email}</strong> is not authorized yet.
        </p>
        <p className="text-gray-500 mb-4">
          {status === 'pending' && 'Waiting for admin approval...'}
          {status === 'approved' && 'You are now approved!'}
          {status === 'rejected' && 'Your request has been rejected.'}
        </p>

        {status === 'approved' && (
          <button
            onClick={() => router.push('/boq')}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            🚀 Go to BOQ
          </button>
        )}
      </div>
    </div>
  );
}
