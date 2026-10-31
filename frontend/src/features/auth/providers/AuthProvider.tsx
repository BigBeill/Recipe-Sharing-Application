"use client"

import { createContext, use, useContext, useState } from 'react';
import { TypeSession } from '../server/session';
import { logout } from '../server/logout';

type AuthState = { session: TypeSession; sessionStatus: 'authenticated'; } 
	| { session: null; sessionStatus: 'pending' | 'guest'; }

type AuthContextValue = AuthState & { 
	overrideSession: (session: TypeSession | null) => void;
	logoutSession: () => Promise<void>;
};

const SessionContext = createContext<AuthContextValue | null>(null);

interface props {
	sessionPromise: Promise<TypeSession | null>
	children: React.ReactNode;
}

export default function AuthProvider({ sessionPromise, children }: props) {
	const resolved = use(sessionPromise);

	const [override, setOverride] = useState<{
		source: Promise<TypeSession | null>;
		session: TypeSession | null;
	} | null>(null);

	const session = override?.source === sessionPromise ? override.session : resolved;

	const state: AuthState = session
		? { session, sessionStatus: 'authenticated' }
		: { session: null, sessionStatus: 'guest' };

	function overrideSession(newSession: TypeSession | null) {
      setOverride({ source: sessionPromise, session: newSession });
   }

	async function logoutSession() {
		await logout();
		overrideSession(null);
	}

	return (
		<SessionContext.Provider value={ { ...state, overrideSession, logoutSession } }>
			{ children }
		</SessionContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(SessionContext);
	if (!context) { throw new Error ('useAuth must be used inside AuthProvider'); }
	else { return context; }
}