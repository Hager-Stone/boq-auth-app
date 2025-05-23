'use client';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { app } from '@/firebase/clientApp';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async () => {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email ?? "";

      if (email.endsWith("@hagerstone.com")) {
        router.push('/boq');
      } else {
        router.push(`/request-access?email=${email}`);
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md text-center">
        <h2 className="text-xl font-bold mb-4">Login to BOQ System</h2>
        <button onClick={handleLogin} className="bg-green-600 px-5 py-2 text-white rounded">
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
