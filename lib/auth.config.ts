import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith('/login');
      const isOnAdminUsers = nextUrl.pathname.startsWith('/admin/users');
      const isOnAdminCategories = nextUrl.pathname.startsWith('/admin/categories');
      const isOnInventoryAdd = nextUrl.pathname === '/inventory/add';

      if (isOnLogin) {
        if (isLoggedIn) return Response.redirect(new URL('/dashboard', nextUrl));
        return true;
      }

      if (!isLoggedIn) return false;

      // Role-based protection
      const role = auth?.user?.role;

      if (isOnAdminUsers && role !== 'SUPER_ADMIN') {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      if (isOnAdminCategories && role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      if (isOnInventoryAdd && role === 'INSPECTOR') {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      return true;
    },
  },
  providers: [],
};
