"use client"

import { useAuth } from "@/features/auth/providers/AuthProvider";
import { LinkPair } from "@/shared/components/Link.components";

/** Selects account-entry or recipe-management links from the current session status. */
export default function LandingPageLinks() {
   const { sessionStatus } = useAuth();

   if (sessionStatus !== 'authenticated') { return <LinkPair first={ { text: "Get Started", href: '/auth/register' } } second={ { text: 'Sign In', href: '/auth/login' } } /> }
   else { return <LinkPair first={ { text: "Create Recipe", href: '/editRecipe' } } second={ { text: 'My Recipes', href: '/searchRecipes/personal' } } /> }
}