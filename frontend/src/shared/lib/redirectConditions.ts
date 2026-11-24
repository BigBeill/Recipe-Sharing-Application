import { useAuth } from "@/features/auth/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function redirectAuthenticatedUser() {
   const router = useRouter();
   const { sessionStatus } = useAuth();

   useEffect(() => {
      if (sessionStatus === 'authenticated') { router.replace('/'); }
   },[sessionStatus]);
}

export function redirectGuestUser() {
   const router = useRouter();
   const { sessionStatus } = useAuth();

   useEffect(() => {
      if (sessionStatus === 'guest') { router.replace('/auth/login'); }
   },[sessionStatus]);
}