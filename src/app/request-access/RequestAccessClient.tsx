'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { app } from '@/firebase/clientApp';

export default function RequestAccessClient() {
  const db = getFirestore(app);
  const params = useSearchParams();
  const email = params.get("email");
  const router = useRouter();

  const [status, setStatus] = useState("pending");

  useEffect(() => {
    if (!email) return;

    const docRef = doc(db, 'access_requests', email);

    const checkOrCreate = async () => {
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          email,
          status: "pending",
          requestedAt: new Date().toISOString(),
        });
        setStatus("pending");
      } else {
        setStatus(docSnap.data().status);
      }
    };

    checkOrCreate();

    // 🔁 Real-time listener
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const newStatus = docSnap.data().status;
        setStatus(newStatus);

        if (newStatus === 'approved') {
          router.push('/boq');
        } else if (newStatus === 'rejected') {
          router.push('/unauthorized');
        }
      }
    });

    return () => unsubscribe();
  }, [email, db, router]);

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
            onClick={() => router.push("/boq")}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            🚀 Go to BOQ
          </button>
        )}
      </div>
    </div>
  );
}
