// src/hooks/useAccessRequests.ts
'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, getFirestore } from 'firebase/firestore';
import { app } from '@/firebase/clientApp';

export type AccessRequest = {
  email: string;
  status: string;
  requestedAt: { seconds: number; nanoseconds: number };
  approvedAt?: { seconds: number; nanoseconds: number };
};

export default function useAccessRequests() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getFirestore(app);
    const requestsRef = collection(db, 'access_requests');

    const unsubscribe = onSnapshot(
      requestsRef,
      (snapshot) => {
        const data: AccessRequest[] = [];
        snapshot.forEach((doc) => {
          const { email, status, requestedAt, approvedAt } = doc.data();
          data.push({
            email,
            status,
            requestedAt,
            approvedAt,
          });
        });
        setRequests(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching requests:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { requests, loading, error };
}
