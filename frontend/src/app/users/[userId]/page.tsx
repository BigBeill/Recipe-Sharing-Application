import ProfilePage from "@/features/users/components/ProfilePage";
import { userService } from "@/features/users/services/user.service.server";
import preRenderService from "@/shared/lib/preRenderService";

export default async function Page({ params }: { params: Promise<{userId: string}> }) {
   const { userId } = await params;

   const user = await preRenderService(() => { return userService.get(userId, { includeRelationship: true }); });
   return <ProfilePage initial={ user } />
}