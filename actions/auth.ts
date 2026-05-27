'use server';

import { signIn, signOut } from '@/lib/auth';
import { AuthError } from 'next-auth';

export async function loginAction(formData: FormData) {
  try {
    await signIn('credentials', {
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      redirectTo: '/dashboard',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Username atau password salah.' };
        default:
          return { error: 'Terjadi kesalahan. Silakan coba lagi.' };
      }
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: '/login' });
}
