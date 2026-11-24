"use client"

import { createContext, use, useContext, useEffect, useEffectEvent, useState } from 'react';
import type { TypeSession } from '../server/session';
import { type AuthEvent, authEvents } from './authentication.events.client';
import { useRouter } from 'next/navigation';

type AuthState = { session: TypeSession; sessionStatus: 'authenticated'; } 
	| { session: null; sessionStatus: 'pending' | 'guest'; }
const SessionContext = createContext<AuthState | null>(null);

interface props {
	sessionPromise: Promise<TypeSession | null>
	children: React.ReactNode;
}

export default function AuthProvider({ sessionPromise, children }: props) {
	const resolved = use(sessionPromise);
	const router = useRouter();

	const [override, setOverride] = useState<{
		source: Promise<TypeSession | null>;
		session: TypeSession | null;
	} | null>(null);

	const session = override?.source === sessionPromise ? override.session : resolved;

	function overrideSession(newSession: TypeSession | null) {
      setOverride({ source: sessionPromise, session: newSession });
   }

	const onAuthEvent = useEffectEvent((event: AuthEvent) => {
		if (event.type === 'signedOut') { 
			overrideSession(null);
			router.push('/auth/login');
		}
		else if (event.session) { 
			overrideSession(event.session); 
			router.push('/');
		}
   	else { router.refresh(); }
	})

	useEffect(() => { return authEvents.subscribe((event) => { onAuthEvent(event); }) }, []);

	const state: AuthState = session
		? { session, sessionStatus: 'authenticated' }
		: { session: null, sessionStatus: 'guest' };

	return (
		<SessionContext.Provider value={ state }>
			{ children }
		</SessionContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(SessionContext);
	if (!context) { throw new Error ('useAuth must be used inside AuthProvider'); }
	else { return context; }
}