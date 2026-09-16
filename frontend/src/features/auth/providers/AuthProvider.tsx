"use client"

import { createContext, useContext, useEffect, useState } from 'react';
import { TypeSession } from '../server/session';
import { logout } from '../server/logout';

type AuthState = { 
	session: TypeSession; 
	sessionStatus: 'authenticated'; 
} | { 
	session: null; 
	sessionStatus: 'pending' | 'guest' 
}

type AuthContextValue = AuthState & { 
	overrideSession: (session: TypeSession | null) => void;
	logoutSession: () => Promise<void>;
};

const SessionContext = createContext<AuthContextValue | null>(null);

interface props {
	sessionPromise: Promise<TypeSession | null>
	children: React.ReactNode;
}

/** Resolves a server-provided session and exposes pending, guest, or authenticated state to descendants. */
export default function AuthProvider({ sessionPromise, children }: props) {
	const [state, setState] = useState<AuthState>({ session: null, sessionStatus: 'pending' })

	useEffect(() => {
		let cancelled = false;
		sessionPromise.then((resolved) => {
         if (cancelled) return;
			setState({ session: resolved, sessionStatus:(resolved ? 'authenticated' : 'guest') } as AuthState)
      });
		return () => { cancelled = true; };
	},[sessionPromise]);

	/** Replaces the client session and derives its authenticated or guest status. */
	function overrideSession(newSession: TypeSession | null) {
      setState({ session: newSession, sessionStatus: (newSession ? 'authenticated' : 'guest') } as AuthState);
   }

	/** Deletes the authentication cookies before exposing a guest session. */
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

/**
 * Returns the current session context.
 *
 * @throws {Error} If called outside an `AuthProvider`.
 */
export function useAuth() {
	const context = useContext(SessionContext);
	if (!context) { throw new Error ('useAuth must be used inside AuthProvider'); }
	else { return context; }
}