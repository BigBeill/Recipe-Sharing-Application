"use client"

import { useEffect, useState } from 'react';
import { authService } from '../services/auth.service.client';
import { useServiceMutation } from '@/shared/hooks/useServiceMutation';
import { ButtonOval } from '@/shared/components/Button.components';
import styles from './login.module.scss';
import { useRouter } from 'next/navigation';
import { InsertError } from '@/shared/components/stateComponents/InsertStateComponents';
import useAuth from '../hooks/useAuth';
import { StateInfoInsert } from '@/shared/components/stateComponents/Info.states';

export default function PasswordResetPage() {
   const [token, setToken] = useState<string | null>(null);

   const router = useRouter();
   const { authId } = useAuth();

   useEffect(() => {
      if (authId !== null) { router.replace("/"); }
   }, [authId]);

   useEffect(() => {
      // check for a token
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.slice(1));
      setToken(params.get('token'));

      //set the background
      document.body.classList.add(styles.loginBackground);
      return () => { document.body.classList.remove(styles.loginBackground); }
   }, []);

   return (
      <div className={ styles.loginForm } id='resetPasswordForm'>
         <h1>Change Your Password</h1>
         { !token ? 
            <GetEmail />
         :
            <GetNewPassword token={ token }/>
         }
      </div>
   )
}



interface TypeGetEmailFields {
   email: string
}

function GetEmail() {
   const [formFields, setFormFields] = useState<TypeGetEmailFields>({ email: "" });
   const passwordResetMutator = useServiceMutation(() => authService.requestPasswordReset(formFields));
   
   useEffect(() => {
      passwordResetMutator.resetToIdle();
   }, [formFields]);

   return (
      <>
         <div className={ styles.textInputWrapper }>
            <input 
               type="email"
               name="newEmail"
               id="newEmail"
               placeholder=' '
               value={ formFields.email }
               onChange={(event) => { setFormFields((previous) => { return { ...previous, email: event.target.value } }) } }
               onKeyDown={(event) => { if (event.key === 'Enter') { passwordResetMutator.send(undefined) } }}
            />
            <label htmlFor="newEmail">Enter Your Email</label>
         </div>

         <ButtonOval 
            name="submit"
            id="submitButton"
            style={{ margin: '0rem', width: '100%', padding: '0.6rem 2rem' }}
            onClick={ () => { passwordResetMutator.send(undefined); } }
            loadingState={ passwordResetMutator.status === 'loading' }
         >Change Password</ButtonOval>
         
         { passwordResetMutator.status == 'error' &&
            <InsertError error={ passwordResetMutator.error } />
         }

         { passwordResetMutator.status === "ready" ?
            <StateInfoInsert>
               A password reset link has been sent to your email!
            </StateInfoInsert>
         : null}
      </>
   )
}



interface TypeGetNewPasswordFields {
   passwordOne: string,
   passwordTwo: string,
   token: string,
}

function GetNewPassword({ token }: {token: string}) {
   const router = useRouter();

   const [formFields, setFormFields] = useState<TypeGetNewPasswordFields>({ passwordOne: "", passwordTwo: "", token});
   const resetPasswordMutator = useServiceMutation(() => authService.resetPassword({ password: formFields.passwordOne, token }));

   useEffect(() => {
      if (resetPasswordMutator.status === "ready") { router.replace('/auth/login'); }
   }, [resetPasswordMutator.status]);

   useEffect(() => {
      resetPasswordMutator.resetToIdle();
   }, [formFields])

   return (
      <div className={ styles.loginForm } id='resetPasswordForm'>
         <h1>Change Your Password</h1>
         <div className={ styles.textInputWrapper }>
            <input 
               type="password"
               name="newPassword"
               id="newPasswordOne"
               placeholder=' '
               onChange={(event) => { setFormFields((previous) => { return { ...previous, passwordOne: event.target.value } }) } }
               onKeyDown={(event) => { if (event.key === 'Enter') { resetPasswordMutator.send(undefined); } }}
            />
            <label htmlFor="newPasswordOne">Enter New Password</label>
         </div>
         <div className={ styles.textInputWrapper }>
            <input 
               type="password"
               name="newPasswordConfirm"
               id="newPasswordTwo"
               placeholder=' '
               onChange={(event) => { setFormFields((previous) => { return { ...previous, passwordTwo: event.target.value } }) } }
               onKeyDown={(event) => { if (event.key === 'Enter') { resetPasswordMutator.send(undefined); } }}
            />
            <label htmlFor="newPasswordTwo">Re-Enter New Password</label>
         </div>
         <ButtonOval 
            name="submit"
            id="submitButton"
            style={{ margin: '0rem', width: '100%', padding: '0.6rem 2rem' }}
            onClick={ () => { resetPasswordMutator.send(undefined); } }
            loadingState={ resetPasswordMutator.status === 'loading' }
         > Change Password </ButtonOval>

         { resetPasswordMutator.status == 'error' &&
            <InsertError error={ resetPasswordMutator.error } />
         }

         <p>Need a new link?</p>
         <a href='/resetPassword'>Reset Password</a>
      </div>
   );
}