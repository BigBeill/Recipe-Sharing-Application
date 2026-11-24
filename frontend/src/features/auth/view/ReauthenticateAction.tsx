"use client"

import { Ref, useImperativeHandle, useRef, useState } from 'react';
import { FullscreenPage } from '@/shared/view/pages/Fullscreen.page';
import { TypeDataHandle } from '@/shared/domain/shared.types';
import AuthenticationFormLayout, { AuthenticationFormSubmitButton, AuthenticationFormTextBox, AuthenticationFormTitle } from './pages/FormLayout';

//* Some user actions are dangerous, the server is going to need to need a password attached to the request.
//* This is to make sure the server can authenticate with the request and isn't relying on a potentially comprized accessToken

export default function ReauthenticatePopup<P extends object, R>({ ref, action }: { ref: Ref<TypeDataHandle<boolean>>, action: { description: string, function: (password: string) => Promise<void> } }) {


   const fullscreenRef = useRef<TypeDataHandle<boolean>>(null);

   useImperativeHandle(ref, () => ({
      getData: async () => fullscreenRef.current!.getData(),
      setData: async (value) => { fullscreenRef.current!.setData(value); }
   }), [fullscreenRef]);

   const refCollection = {
      password: useRef<TypeDataHandle<string>>(null)
   }

   return (
      <FullscreenPage ref={ fullscreenRef } >
         <AuthenticationFormLayout
            service={ async ({ password }: { password: string }) => { 
               await action.function(password) 
               fullscreenRef.current!.setData(false);
            } }
            refs={ refCollection }
            errorHandler={ (error) => { throw error } }
         >
            <AuthenticationFormTitle>Enter your password</AuthenticationFormTitle>
            <p>The { action.description } action requires confirming that the correct person has access to your account. Please re-enter your password</p>
            <AuthenticationFormTextBox type="password" name="password" ref={ refCollection.password } />
            <AuthenticationFormSubmitButton>{ action.description }</AuthenticationFormSubmitButton>
         </AuthenticationFormLayout>
      </FullscreenPage>
   )
}