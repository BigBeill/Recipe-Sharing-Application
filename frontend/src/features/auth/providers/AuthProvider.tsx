"use client"

import { createContext, useCallback, useState, useMemo } from 'react';
import { authService } from '../services/auth.service.client';
import { useRouter } from 'next/navigation';

type AuthContextType = {
	authId: string | null
	override: (newAuthId: string | null) => void;
	logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
	authId: null,
	override: () => {},
	logout: async () => {},
});

interface props {
	initial: string | null; // initial authId
	children: React.ReactNode;
}

export default function AuthProvider({ initial = null, children }: props) {

	const router = useRouter();
	const [authId, setAuthId] = useState<string | null>(initial);

	const logout = useCallback(async () => {
		try { await authService.logout(); } 
		catch (error) { console.error(error); } 
		finally {
			setAuthId(null);
			router.push('/');
		}
	}, [router]);

	const value = useMemo<AuthContextType>(() => ({ 
		authId,
		override: (newAuthId) => { setAuthId(newAuthId) }, logout 
	}),[authId, logout]);

	return (
		<AuthContext.Provider value={ value  }>
			{children}
		</AuthContext.Provider>
	);
}