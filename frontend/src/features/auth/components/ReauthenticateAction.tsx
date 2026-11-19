"use client"

import styles from './login.module.scss';
import { ButtonOval } from '@/shared/view/components/Button.components';
import { StateErrorInsert } from '@/shared/view/states/Error.states';
import { useServiceMutation } from '@/shared/lib/hooks/useServiceMutation';
import { LoadingProvider } from '@/shared/lib/hooks/loadingContext';
import { Ref, useImperativeHandle, useRef, useState } from 'react';
import { FullscreenPage } from '@/shared/view/pages/Fullscreen.page';
import { DataHandle } from '@/shared/domain/shared.types';

//* Some user actions are dangerous, the server is going to need to need a password attached to the request.
//* This is to make sure the server can authenticate with the request and isn't relying on a potentially comprized accessToken

export default function ReauthenticatePopup<P extends object, R>({ ref, action }: { ref: Ref<DataHandle<boolean>>, action: { description: string, function: (password: string) => Promise<void> } }) {


   const fullscreenRef = useRef<DataHandle<boolean>>(null);

   useImperativeHandle(ref, () => ({
      getData: async () => fullscreenRef.current!.getData(),
      setData: async (value) => { fullscreenRef.current!.setData(value); }
   }), [fullscreenRef]);

   const [password, setPassword] = useState<string>("");

   const actionMutator = useServiceMutation(async () => {
      await action.function(password);
      fullscreenRef.current!.setData(false);
      
   });

   return (
      <FullscreenPage ref={ fullscreenRef } >
         <LoadingProvider value={ actionMutator.status === "loading" } >
            <div className={ styles.loginForm } id="loginForm">
               <h1>Enter your password</h1>
               <p>{ action.description } requires confirming that the correct person has access to your account. Please re-enter your password</p>
               <div className={ styles.textInputWrapper }>
                  <input
                     type="password"
                     name="password"
                     id="password"
                     placeholder=' '
                     value={ password }
                     onChange={ (event) => setPassword(event.target.value) }
                     onKeyDown={ (event) => { if (event.key === 'Enter') { actionMutator.send() } } }
                  />
                  <label htmlFor="password">Password</label>
               </div>

               <ButtonOval
                  name="Submit"
                  type="submit"
                  id="submitButton"
                  style={{ margin: '0rem', width: '100%', padding: '0.6rem 2rem' }}
                  onClick={ () => { actionMutator.send(); } }
                  showLoading={ true }
               > Delete Account </ButtonOval>

               { actionMutator.status == 'error' &&
                  <StateErrorInsert error={ actionMutator.error } />
               }

            </div>
         </LoadingProvider>
      </FullscreenPage>
   )
}