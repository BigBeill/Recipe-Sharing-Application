"use client"

import { useEffect, useRef, useState } from 'react';
import { authService } from '../../services/auth.service.client';
import AuthenticationFormLayout, { AuthenticationFormSubmitButton, AuthenticationFormTextBox, AuthenticationFormTitle } from './FormLayout';
import { TypeDataHandle } from '@/shared/domain/shared.types';
import { ErrorValidation } from '@/shared/domain/errorClasses';
import { useRouter } from 'next/navigation';
import { requireGuestUser } from '@/shared/lib/redirectConditions';

export default function PasswordResetPage() {
   requireGuestUser()
   const [token, setToken] = useState<string | null>(null);

   useEffect(() => {
      // check for a token
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.slice(1));
      setToken(params.get('token'));
   }, []);

   if (!token) { return <GetEmail /> }
   else { return <GetNewPassword token={ token } /> }
}

function GetEmail() {

   const refCollection = {
      email: useRef<TypeDataHandle<string>>(null),
   }

   return (
      <AuthenticationFormLayout
         refs={ refCollection }
         service={ authService.requestPasswordReset }
         errorHandler={ (error) => { throw error; } }
      >
         <AuthenticationFormTitle>Request Password Reset Link</AuthenticationFormTitle>
         <AuthenticationFormTextBox name="email" type='email' ref={ refCollection.email } />
         <AuthenticationFormSubmitButton successMessage='A password reset link has been sent to your email!' >Request Link</AuthenticationFormSubmitButton>
      </AuthenticationFormLayout>
   )
}



function GetNewPassword({ token }: {token: string}) {

   const router = useRouter();

   const refCollection = {
      passwordOne: useRef<TypeDataHandle<string>>(null),
      passwordTwo: useRef<TypeDataHandle<string>>(null),
   }

   async function serviceCall({ passwordOne, passwordTwo }: { passwordOne: string, passwordTwo: string }) {
      if (passwordOne !== passwordTwo) { throw new ErrorValidation("Passwords to not match!", []); }
      await authService.resetPassword({ password: passwordOne, token });
      router.replace('/auth/login');
   }

   return (
      <AuthenticationFormLayout
         refs={ refCollection }
         service={ serviceCall }
         errorHandler={ (error) => { throw error; } }
      >
         <AuthenticationFormTitle>Update your password</AuthenticationFormTitle>
         <AuthenticationFormTextBox name="password" type='password' ref={ refCollection.passwordOne } />
         <AuthenticationFormTextBox name="confirm password" type='password' ref={ refCollection.passwordTwo } />
         <AuthenticationFormSubmitButton>Update password</AuthenticationFormSubmitButton>
         <p>Need a new link?</p>
         <a href='/resetPassword'>Reset Password</a>
      </AuthenticationFormLayout>
   );
}