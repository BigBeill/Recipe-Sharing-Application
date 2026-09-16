'use server';

import { cookies } from 'next/headers';

/** Deletes the access-token and refresh-token cookies. */
export async function logout() {
   const cookieStore = await cookies();
   cookieStore.delete('accessToken');
   cookieStore.delete('refreshToken');
}