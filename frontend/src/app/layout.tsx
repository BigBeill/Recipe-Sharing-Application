import AuthProvider from '@/features/auth/providers/AuthProvider';
import '../shared/styles/globals.scss';
import Header from '@/shared/components/Header';
import { verifySession } from '@/features/auth/server/session';

interface LayoutProps {
  children: React.ReactNode;
}

export default async function Layout({ children }: LayoutProps) {
   const session = await verifySession();

   return(
      <html lang="en">
         <body>
            <AuthProvider initial={ session?.userId ?? null }>
               <Header />
               <main>
                  { children }
               </main>
            </AuthProvider>
         </body>
      </html>
   )
}