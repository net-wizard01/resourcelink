'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) { setStatus('error'); return; }

    api.get(`/auth/verify-email?token=${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
      <div className="bg-white dark:bg-slate-900 p-10 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 text-center max-w-md w-full mx-4">
        {status === 'loading' && (
          <>
            <Loader2 className="animate-spin mx-auto text-blue-600 mb-4" size={48} />
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Verifying your email...</h2>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="mx-auto text-green-500 mb-4" size={48} />
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Email Verified!</h2>
            <p className="text-gray-500 dark:text-slate-400 mt-2 mb-6">Your account is now active. You can log in.</p>
            <button onClick={() => router.push('/login')} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">
              Go to Login
            </button>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Verification Failed</h2>
            <p className="text-gray-500 dark:text-slate-400 mt-2 mb-6">The link is invalid or has expired.</p>
            <button onClick={() => router.push('/login')} className="w-full bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white py-2 rounded-lg font-semibold">
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
