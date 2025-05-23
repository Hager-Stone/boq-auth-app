'use client';
import AdminGuard from '@/components/AdminGuard';
import useAccessRequests, { AccessRequest } from '@/hooks/useAccessRequests';
import { getFirestore, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { app } from '@/firebase/clientApp';
import { useState } from 'react';
import UserInfo from '@/components/UserInfo';

export default function AdminPage() {
  const { requests, loading, error } = useAccessRequests();
  const [updating, setUpdating] = useState<string | null>(null);
  const db = getFirestore(app);

  const handleStatusChange = async (email: string, status: string) => {
    try {
      setUpdating(email);
      const requestRef = doc(db, 'access_requests', email);
      await updateDoc(requestRef, {
        status,
        approvedAt: status === 'approved' ? serverTimestamp() : null,
      });
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (timestamp: AccessRequest['requestedAt']) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString('en-IN');
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Loading access requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="p-6">
        <UserInfo />
        <h1 className="text-2xl font-semibold mb-4">🔐 Admin - Access Control</h1>
        {requests.length === 0 ? (
          <p className="text-gray-500">No access requests yet.</p>
        ) : (
          <table className="table-auto w-full border-collapse border">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Requested At</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.email}>
                  <td className="border px-4 py-2">{req.email}</td>
                  <td className="border px-4 py-2">{formatDate(req.requestedAt)}</td>
                  <td className="border px-4 py-2 capitalize">{req.status}</td>
                  <td className="border px-4 py-2 flex gap-2">
                    <button
                      className={`bg-green-600 text-white px-2 py-1 rounded ${
                        updating === req.email ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      onClick={() => handleStatusChange(req.email, 'approved')}
                      disabled={updating === req.email}
                    >
                      ✅ Approve
                    </button>
                    <button
                      className={`bg-yellow-500 text-white px-2 py-1 rounded ${
                        updating === req.email ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      onClick={() => handleStatusChange(req.email, 'pending')}
                      disabled={updating === req.email}
                    >
                      ⏳ Pending
                    </button>
                    <button
                      className={`bg-red-600 text-white px-2 py-1 rounded ${
                        updating === req.email ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      onClick={() => handleStatusChange(req.email, 'rejected')}
                      disabled={updating === req.email}
                    >
                      ❌ Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminGuard>
  );
}
