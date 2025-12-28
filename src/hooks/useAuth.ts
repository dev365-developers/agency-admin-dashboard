import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/AuthStore';

export function useAuth(requireAuth = true) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (requireAuth && !isAuthenticated && pathname !== '/login') {
      router.push('/login');
    } else if (!requireAuth && isAuthenticated && pathname === '/login') {
      router.push('/overview');
    }
  }, [isAuthenticated, requireAuth, pathname, router]);

  return { isAuthenticated };
}