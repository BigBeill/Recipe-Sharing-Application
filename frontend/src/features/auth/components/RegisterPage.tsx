"use client"

import { useState, useEffect } from 'react';
import styles from './login.module.scss';
import { useRouter } from 'next/navigation';
import { ButtonOval } from '@/shared/components/Button.components';
import { authService } from '../services/auth.service.client';
import { useServiceMutation } from '@/shared/hooks/useServiceMutation';
import { InsertError } from '@/shared/components/stateComponents/InsertStateComponents';
import useAuth from '../hooks/useAuth';

interface TypeRegisterData {
   username: string,
   email: string,
   passwordOne: string,
   passwordTwo: string,
}

export default function RegisterPage() {

   const router = useRouter();
   const { override: overrideAuth } = useAuth();

   const [registerData, setRegisterData] = useState<TypeRegisterData>({ username: "", email: "", passwordOne: "", passwordTwo: "" });
   const registerMutator = useServiceMutation((input: TypeRegisterData) => authService.register({ ...input, name: input.username }));

   useEffect(() => {
      document.body.classList.add(styles.loginBackground);
      return () => { document.body.classList.remove(styles.loginBackground); }
   }, []);

   useEffect(() => {
      if (registerMutator.status === "ready") { 
         overrideAuth(registerMutator.data._id)
         router.replace('/');
      }
   }, [registerMutator.status]);

   useEffect(() => {
      registerMutator.resetToIdle();
   }, [registerData])

   return (
      <div className={styles.loginForm} id="registerForm">
         <h1>Create Account</h1>

         <div className={styles.textInputWrapper}>
            <input
               type="text"
               name="username"
               id="username"
               placeholder=' '
               value={ registerData.username }
               onChange={ (event) => setRegisterData((data) => ({...data, username: event.target.value })) }
               onKeyDown={ (event) => { if (event.key === 'Enter') { registerMutator.send(registerData) } } }
            />
            <label htmlFor="username">Username</label>
         </div>

         <div className={styles.textInputWrapper}>
            <input
               type="text"
               name="email"
               id="email"
               placeholder=' '
               value={ registerData.email }
               onChange={ (event) => setRegisterData((data) => ({ ...data, email: event.target.value })) }
               onKeyDown={ (event) => { if (event.key === 'Enter') { registerMutator.send(registerData) } } }
            />
            <label htmlFor="email">Email</label>
         </div>

         <div className={styles.textInputWrapper}>
            <input
               type="password"
               name="passwordOne"
               id="passwordOne"
               placeholder=' '
               value={ registerData.passwordOne }
               onChange={ (event) => setRegisterData((data) => ({ ...data, passwordOne: event.target.value })) }
               onKeyDown={ (event) => { if (event.key === 'Enter') { registerMutator.send(registerData) } } }
            />
            <label htmlFor="passwordOne">Password</label>
         </div>

         <div className={styles.textInputWrapper}>
            <input
               type="password"
               name="passwordTwo"
               id="passwordTwo"
               placeholder=' '
               value={ registerData.passwordTwo }
               onChange={ (event) => setRegisterData((data) => ({ ...data, passwordTwo: event.target.value })) }
               onKeyDown={ (event) => { if (event.key === 'Enter') { registerMutator.send(registerData) } } }
            />
            <label htmlFor="passwordTwo">Confirm Password</label>
         </div>

         <ButtonOval
            name="submit"
            id="submitButton"
            style={{ margin: '0rem', width: '100%', padding: '0.6rem 2rem' }}
            onClick={ () => registerMutator.send(registerData) }
            loadingState={ registerMutator.status === 'loading' }
         > Create Account </ButtonOval>

         { registerMutator.status == 'error' &&
            <InsertError error={ registerMutator.error } />
         }

         <p>Already have an account?</p>
         <a href='/auth/login'>Login</a>

      </div>
   )
}