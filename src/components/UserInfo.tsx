'use client';
import { getAuth, signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { app } from '@/firebase/clientApp';

export default function UserInfo() {
  const [email, setEmail] = useState('');

  useEffect(() => {
    const auth = getAuth(app);
    const user = auth.currentUser;
    if (user) setEmail(user.email || '');
  }, []);

  return (
    <div className="text-sm text-right">
      <p className="text-gray-600">Logged in as: {email}</p>
      <button
        onClick={() => signOut(getAuth(app))}
        className="text-red-500 underline mt-1 text-xs"
      >
        Logout
      </button>
    </div>
  );
}
