import { verifySession } from "@/features/auth/server/session";
import PasswordResetPage from "@/features/auth/view/pages/PasswordResetPage";
import { redirect } from "next/navigation";

export default async function RequestDefaultPassword() {

   const session = await verifySession();
   if (session !== null) { redirect('/'); }

   return <PasswordResetPage />
}