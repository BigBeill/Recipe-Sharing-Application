import { useAuth } from "@/features/auth/providers/AuthProvider";
import { TypeSession } from "@/features/auth/server/session";
import { useState } from "react";

export function requireAuthenticatedUser(): TypeSession {
   const { session, sessionStatus } = useAuth();

   const [authOnMount] = useState({ sessionStatus, session });
   if (authOnMount.sessionStatus !== 'authenticated') { throw new Error("Attempting to call a component that requires the user to be authenticated to use") }
   else { return authOnMount.session!; }
}

export function requireGuestUser() {
   const { sessionStatus } = useAuth();

   const [sessionStatusOnMount] = useState(sessionStatus);
   if (sessionStatusOnMount !== 'guest') { throw new Error("Attempting to call a component that requires the user to be un-authenticated to use") }
}