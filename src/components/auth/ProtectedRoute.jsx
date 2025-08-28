'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../context/UserContext';

const ProtectedRoute = ({ children, requireSuperAdmin = false }) => {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // If user is not authenticated, redirect to login
      if (!user) {
        router.push('/login');
        return;
      }

      // If super admin access is required but user is not super admin
      if (requireSuperAdmin && (!user.isSuperAdmin || user.user_type !== 'superAdmin')) {
        router.push('/dashboard?error=access_denied');
        return;
      }
    }
  }, [user, isLoading, requireSuperAdmin, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  // Don't render if super admin access required but user is not super admin
  if (requireSuperAdmin && (!user.isSuperAdmin || user.user_type !== 'superAdmin')) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;