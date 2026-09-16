import AuthProvider from '@/features/auth/providers/AuthProvider';
import '../shared/styles/globals.scss';
import Header from '@/shared/components/Header';
import { verifySession } from '@/features/auth/server/session';

interface LayoutProps {
  children: React.ReactNode;
}

/** Starts session verification and exposes its pending result through the application shell. */
export default async function Layout({ children }: LayoutProps) {
   const sessionPromise = verifySession();

   return(
      <html lang="en">
         <body>
            <AuthProvider sessionPromise={ sessionPromise }>
               <Header />
               <main>
                  { children }
               </main>
            </AuthProvider>
         </body>
      </html>
   )
}