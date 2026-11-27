"use client"

import { useRef } from 'react';
import AuthenticationFormLayout, { AuthenticationFormSubmitButton, AuthenticationFormTextBox, AuthenticationFormTitle } from './FormLayout';
import { authService } from '../../services/auth.service.client';
import { TypeDataHandle } from '@/shared/domain/shared.types';
import { requireGuestUser } from '@/shared/lib/redirectConditions';

export default function RegisterPage() {
   requireGuestUser();

   const refCollection = {
      name: useRef<TypeDataHandle<string>>(null),
      email: useRef<TypeDataHandle<string>>(null),
      passwordOne: useRef<TypeDataHandle<string>>(null),
      passwordTwo: useRef<TypeDataHandle<string>>(null),
   }

   return (
      <AuthenticationFormLayout
         service={ authService.register }
         refs={ refCollection }
         errorHandler={ (error) => { throw error } }
      >
         <AuthenticationFormTitle>Create Account</AuthenticationFormTitle>
         <AuthenticationFormTextBox type='text' name='username' ref={ refCollection.name } />
         <AuthenticationFormTextBox type='email' name='email' ref={ refCollection.email } />
         <AuthenticationFormTextBox type='password' name='password' ref={ refCollection.passwordOne } />
         <AuthenticationFormTextBox type='password' name='confirm password' ref={ refCollection.passwordTwo } />
         <AuthenticationFormSubmitButton>Create Account</AuthenticationFormSubmitButton>

         <p>Already have an account?</p>
         <a href='/auth/login'>Login</a>
      </AuthenticationFormLayout>
   )
}