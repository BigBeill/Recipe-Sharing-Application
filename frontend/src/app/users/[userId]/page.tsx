import { verifySession } from "@/features/auth/server/session";
import ProfilePage from "@/features/users/components/ProfilePage";
import { userService } from "@/features/users/services/user.service.server";
import preRenderService from "@/shared/lib/preRenderService";
import { redirect } from "next/navigation";

export default async function Page({ params }: { params: Promise<{userId: string}> }) {
   const { userId } = await params;
   const session = await verifySession();
   if (!session) { redirect('/auth/login'); }

   const user = await preRenderService(() => { return userService.get(userId, { includeRelationship: true }); });
   return <ProfilePage initial={ user } />
}