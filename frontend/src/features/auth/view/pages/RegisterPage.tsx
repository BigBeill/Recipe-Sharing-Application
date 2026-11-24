"use client"

import { useRef } from 'react';
import { redirectAuthenticatedUser } from '@/shared/lib/redirectConditions';
import AuthenticationFormLayout, { AuthenticationFormSubmitButton, AuthenticationFormTextBox, AuthenticationFormTitle } from './FormLayout';
import { authService } from '../../services/auth.service.client';
import { TypeDataHandle } from '@/shared/domain/shared.types';

export default function RegisterPage() {
   redirectAuthenticatedUser();

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
         <AuthenticationFormTextBox type='email' name='username' ref={ refCollection.name } />
         <AuthenticationFormTextBox type='password' name='password' ref={ refCollection.passwordOne } />
         <AuthenticationFormTextBox type='password' name='confirm password' ref={ refCollection.passwordTwo } />
         <AuthenticationFormSubmitButton>Create Account</AuthenticationFormSubmitButton>

         <p>Already have an account?</p>
         <a href='/auth/login'>Login</a>
      </AuthenticationFormLayout>
   )
}