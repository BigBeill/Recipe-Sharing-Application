"use client"

import useAuth from "@/features/auth/hooks/useAuth";
import { LinkPair } from "@/shared/components/Link.components";

export default function LandingPageLinks() {
   const { authId } = useAuth();

   if (!authId) { return <LinkPair first={ { text: "Get Started", href: '/auth/register' } } second={ { text: 'Sign In', href: '/auth/login' } } /> }
   else { return <LinkPair first={ { text: "Create Recipe", href: '/editRecipe' } } second={ { text: 'My Recipes', href: '/searchRecipes/personal' } } /> }
}