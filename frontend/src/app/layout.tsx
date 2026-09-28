import AuthProvider from '@/features/auth/providers/AuthProvider';
import '../shared/styles/globals.scss';
import { verifySession } from '@/features/auth/server/session';
import Header from '@/shared/view/layout/Header.layout';

interface LayoutProps {
  children: React.ReactNode;
}

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