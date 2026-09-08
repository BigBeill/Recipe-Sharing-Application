// Middleware between the client and the vercel server
// Before any page request is sent to vercel, this middleware makes sure the access token is either valid or does not exist

import { NextRequest, NextResponse } from 'next/server';
import { decodeJwt } from 'jose';

const BUFFER_SECONDS = 30;

function isStale(token: string | undefined): boolean {
   if (!token) { return true; }
   try {
      const { exp } = decodeJwt(token);
      return !exp || exp - BUFFER_SECONDS <= Date.now() / 1000;
   } 
   catch { return true; }
}

export async function middleware(request: NextRequest) {

   // check for an access token and pass the request along if it is valid
   const accessToken = request.cookies.get('accessToken')?.value;
   if (!isStale(accessToken)) { return NextResponse.next(); }

   // check for a refresh token and pass the request along if none exist
   const refreshToken = request.cookies.get('refreshToken')?.value;
   if (!refreshToken) { return NextResponse.next(); }

   let upstream: Response;
   try {
      upstream = await fetch(`${process.env.ELYSIA_URL}/api/v1/auth/refresh`, {
         method: 'POST',
         headers: { cookie: `refreshToken=${refreshToken}` },
         cache: 'no-store',
      });
   } catch {
      return NextResponse.next(); // Railway unreachable — keep cookies
   }

   // remove tokens if refresh fails
   if (upstream.status === 401) {
      const response = NextResponse.next();
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');
      return response;
   }

   // keep cookies if http failure isn't related to 
   if (!upstream.ok) { return NextResponse.next(); }

   const { data } = await upstream.json();
   if (!data?.accessToken) { return NextResponse.next(); }

   // so this render's cookies() sees the fresh token
   request.cookies.set('accessToken', data.accessToken);
   const response = NextResponse.next({ request });

   // so the browser gets both — forward Elysia's Set-Cookie verbatim
   for (const cookie of upstream.headers.getSetCookie()) {
      response.headers.append('set-cookie', cookie);
   }

   return response;
}

export const config = {
   matcher: [
      '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
   ],
};