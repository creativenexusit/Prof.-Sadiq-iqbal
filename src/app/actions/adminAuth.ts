'use server';

import {
  validateAdminCredentials,
  createAdminToken,
  setAdminSessionCookie,
  clearAdminSessionCookie,
} from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function loginAdmin(
  prevState: unknown,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const email = (formData.get('email') as string) || '';
  const password = (formData.get('password') as string) || '';

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  const isValid = validateAdminCredentials(email, password);
  if (!isValid) {
    return { success: false, error: 'Invalid administrator credentials.' };
  }

  const token = await createAdminToken(email);
  await setAdminSessionCookie(token);

  redirect('/admin');
}

export async function logoutAdmin(): Promise<void> {
  await clearAdminSessionCookie();
  redirect('/login');
}
