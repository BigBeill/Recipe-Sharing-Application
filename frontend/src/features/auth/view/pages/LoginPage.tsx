"use client"

import { useRef } from 'react'
import { authService } from '../../services/auth.service.client';
import { ErrorNotFound, ErrorUnauthorized, ErrorValidation } from '@/shared/domain/errorClasses';
import { redirectAuthenticatedUser } from '@/shared/lib/redirectConditions';
import { TypeDataHandle } from '@/shared/domain/shared.types';
import AuthenticationFormLayout, { AuthenticationFormCheckBox, AuthenticationFormSubmitButton, AuthenticationFormTextBox, AuthenticationFormTitle } from './FormLayout';

export default function LoginPage() {
   redirectAuthenticatedUser();

   const refCollection = {
      name: useRef<TypeDataHandle<string>>(null),
      password: useRef<TypeDataHandle<string>>(null),
      rememberMe: useRef<TypeDataHandle<boolean>>(null),
   }

   function errorResponseHandler(error: unknown): never {
      if (error instanceof ErrorNotFound) { throw new ErrorNotFound("Username does not exist", { cause: error }); }
      else if (error instanceof ErrorUnauthorized) { throw new ErrorUnauthorized("Password was incorrect", { cause: error }); }
      else if (error instanceof ErrorValidation) { throw error; }
      else { throw new Error("Request failed for unknown reasons", { cause: error }) }
   }

   return (
      <AuthenticationFormLayout
         refs={ refCollection }
         service={ authService.login }
         errorHandler={ errorResponseHandler }
      >
         <AuthenticationFormTitle>Login</AuthenticationFormTitle>

         <AuthenticationFormTextBox name="username" ref={ refCollection.name } type="text" />
         <AuthenticationFormTextBox name='password' ref={ refCollection.password } type="password" />
         <AuthenticationFormCheckBox name="remember me" ref={ refCollection.rememberMe } />
         <AuthenticationFormSubmitButton>Login</AuthenticationFormSubmitButton>

         <p>Don&apos;t have an account?</p>
         <a href='/auth/register'>create account</a>
         <p>------------</p>
         <p>Forgot your password?</p>
         <a href='/auth/resetPassword'>reset password</a>

      </AuthenticationFormLayout>
   )
}