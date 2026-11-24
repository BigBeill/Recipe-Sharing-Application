import "client-only";
import type { TypeSession } from "../server/session";

export type AuthEvent =
   | { type: 'signedIn'; session: TypeSession }
   | { type: 'signedOut' };

type Listener = (event: AuthEvent) => void;
const listeners = new Set<Listener>();

export const authEvents = {
   emit: (event: AuthEvent) => listeners.forEach((listener) => listener(event)),
   subscribe: (listener: Listener) => {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
   },
};