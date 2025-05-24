'use client';

import { Suspense } from 'react';
import RequestAccessClient from './RequestAccessClient';

export default function RequestAccessPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <RequestAccessClient />
    </Suspense>
  );
}
