import LoginPage from "@/features/auth/components/LoginPage";
import { verifySession } from "@/features/auth/server/session";
import { redirect } from "next/navigation";

export default async function Login() {

   const session = await verifySession();
   if (session !== null) { redirect('/'); }

   return (
      <LoginPage />
   );
}