"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import styles from './login.module.scss';
import { ButtonOval } from '@/shared/components/Button.components';
import { authService } from '../services/auth.service.client';
import { useServiceMutation } from '@/shared/hooks/useServiceMutation';
import { InsertError } from '@/shared/components/stateComponents/InsertStateComponents';
import useAuth from '../hooks/useAuth';

interface FormDataType {
   username: string,
   password: string,
   rememberMe: boolean,
}

export default function LoginPage() {

   const router = useRouter();
   const { override: overrideAuth } = useAuth();
   const [loginData, setLoginData] = useState<FormDataType>({ username: "", password: "", rememberMe: false });
   const loginMutator = useServiceMutation((input: FormDataType) => authService.login({ ...input, name: input.username }));

   useEffect(() => {
      document.body.classList.add(styles.loginBackground);
      return () => { document.body.classList.remove(styles.loginBackground); }
   }, []);

   useEffect(() => {
      if (loginMutator.status === "ready") { 
         overrideAuth(loginMutator.data._id);
         router.replace('/'); 
      }
   }, [loginMutator.status]);

   useEffect(() => {
      loginMutator.resetToIdle();
   }, [loginData])

   return (
      <div className={styles.loginForm} id="loginForm">
         <h1>Login</h1>
         <div className={styles.textInputWrapper}>
            <input
               type="text"
               name="username"
               id="username"
               placeholder=' '
               value={ loginData.username }
               onChange={ (event) => setLoginData((data) => ({ ...data, username: event.target.value })) }
               onKeyDown={ (event) => { if (event.key === 'Enter') { loginMutator.send(loginData) } } }
            />
            <label htmlFor="username">Username</label>
         </div>

         <div className={styles.textInputWrapper}>
            <input
               type="password"
               name="password"
               id="password"
               placeholder=' '
               value={ loginData.password }
               onChange={ (event) => setLoginData((data) => ({ ...data, password: event.target.value })) }
               onKeyDown={ (event) => { if (event.key === 'Enter') { loginMutator.send(loginData) } } }
            />
            <label htmlFor="password">Password</label>
         </div>

         <div className={styles.checkboxInputWrapper}>
            <input type="checkbox"
            name="remember me"
            id="remember"
            value="1" 
            checked={ loginData.rememberMe }
            onChange={(event) => setLoginData((data) => ({ ...data, rememberMe: event.target.checked })) }
            />
            <label htmlFor="remember">Remember Me</label>
         </div>

         <ButtonOval
            name="Submit"
            type="submit"
            id="submitButton"
            style={{ margin: '0rem', width: '100%', padding: '0.6rem 2rem' }}
            onClick={ () => loginMutator.send(loginData) }
            loadingState={ loginMutator.status === 'loading' }
         > Login </ButtonOval>

         { loginMutator.status == 'error' &&
            <InsertError error={ loginMutator.error } />
         }
         
         <p>Don&apos;t have an account?</p>
         <a href='/auth/register'>create account</a>
         <p>------------</p>
         <p>Forgot your password?</p>
         <a href='/auth/resetPassword'>reset password</a>

      </div>
   )
}