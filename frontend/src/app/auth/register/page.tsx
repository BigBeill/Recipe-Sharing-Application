import RegisterPage from "@/features/auth/components/RegisterPage";
import { verifySession } from "@/features/auth/server/session";
import { redirect } from "next/navigation";

export default async function register() {

   const session = await verifySession();
   if (session !== null) { redirect('/'); }

   return <RegisterPage />
}