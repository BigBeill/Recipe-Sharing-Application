"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import styles from './login.module.scss';
import { ButtonOval } from '@/shared/components/Button.components';
import { authService } from '../services/auth.service.client';
import { useServiceMutation } from '@/shared/hooks/useServiceMutation';
import { InsertError } from '@/shared/components/stateComponents/InsertStateComponents';
import { useAuth } from '../providers/AuthProvider';

interface TypeLoginData {
   name: string,
   password: string,
   rememberMe: boolean,
}

export default function LoginPage() {

   const router = useRouter();
   const { sessionStatus, overrideSession } = useAuth();

   useEffect(() => {
      if (sessionStatus === 'authenticated') { router.replace('/'); }
   },[sessionStatus]);

   const [loginData, setLoginData] = useState<TypeLoginData>({ name: "", password: "", rememberMe: false });
   
   const loginMutator = useServiceMutation(async () => { 
      const response = await authService.login(loginData);
      overrideSession({ userId: response._id, roles: [] });
      router.replace('/');
   });

   useEffect(() => {
      document.body.classList.add(styles.loginBackground);
      return () => { document.body.classList.remove(styles.loginBackground); }
   }, []);

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
               value={ loginData.name }
               onChange={ (event) => setLoginData((data) => ({ ...data, name: event.target.value })) }
               onKeyDown={ (event) => { if (event.key === 'Enter') { loginMutator.send() } } }
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
               onKeyDown={ (event) => { if (event.key === 'Enter') { loginMutator.send() } } }
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