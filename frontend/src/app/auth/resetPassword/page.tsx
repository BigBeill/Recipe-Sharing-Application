import RequestPasswordResetPage from "@/features/auth/components/PasswordResetPage";
import { verifySession } from "@/features/auth/server/session";
import { redirect } from "next/navigation";

export default async function RequestDefaultPassword() {

   const session = await verifySession();
   if (session !== null) { redirect('/'); }

   return <RequestPasswordResetPage />
}