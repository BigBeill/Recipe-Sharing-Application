import styles from './styles/layout.module.scss'
import { LoadingProvider } from "@/shared/lib/hooks/loadingContext"
import { useServiceMutation } from "@/shared/lib/hooks/useServiceMutation"
import { createContext, ReactNode, Ref, useContext, useEffect, useImperativeHandle, useState } from 'react'
import harvestRefCollection, { TypeDataOfHarvestedCollection, TypeDataRefCollection } from '@/shared/lib/harvestRefCollection'
import { TypeDataHandle } from '@/shared/domain/shared.types'
import { ButtonOval } from '@/shared/view/components/Button.components'
import { StateErrorInsert } from '@/shared/view/states/Error.states'
import { StateInfoInsert } from '@/shared/view/states/Info.states'

const AuthenticationFormErrorContext = createContext<{ success: boolean, hasError: boolean, error: unknown }>({ success: false, hasError: false, error: null });

type LayoutProps<T extends TypeDataRefCollection> = {
   refs: T;
   service: (properties: NoInfer<TypeDataOfHarvestedCollection<T>>) => Promise<void>;
   errorHandler: (error: unknown) => never;
   children: ReactNode;
};

export default function AuthenticationFormLayout<T extends TypeDataRefCollection>({ service, errorHandler, refs, children }: LayoutProps<T>) {

   useEffect(() => {
      document.body.classList.add(styles.loginBackground);
      return () => { document.body.classList.remove(styles.loginBackground); }
   }, []);

   const authenticationMutator = useServiceMutation(async () => {
      try { await service(await harvestRefCollection(refs)); }
      catch(error) { errorHandler(error); }
   })

   return (
      <LoadingProvider value={ authenticationMutator.status === "loading" }>
         <AuthenticationFormErrorContext.Provider value={
            authenticationMutator.status === 'error' 
               ? { success: false, hasError: true, error: authenticationMutator.error }
               : authenticationMutator.status === 'ready'
               ? { success: true, hasError: false, error: null }
               : { success: false, hasError: false, error: null }
         }>
            <form 
               className={ styles.authenticationForm } 
               id="authenticationForm" 
               onChange={ () => { authenticationMutator.resetToIdle(); } }
               onSubmit={ (event) => { 
                  event.preventDefault(); 
                  authenticationMutator.send();
               } }
            >
               { children }
            </form>
         </AuthenticationFormErrorContext.Provider>
      </LoadingProvider>
   )
}



export function AuthenticationFormTitle({ children }: { children: string }) {
   return (
      <h1>{ children }</h1>
   )
}



export function AuthenticationFormTextBox({ ref, name, type }: { ref: Ref<TypeDataHandle<string>>, name: string, type: 'text' | 'password' | 'email' }) {

   const [value, setValue] = useState<string>('');

   useImperativeHandle(ref, () => ({
      getData: async () => value,
      setData: async (value) => { setValue(value) },
   }),[value]);

   return (
      <div className={ styles.textboxWrapper } >
         <input 
         id={ name }
         name={ name }
         type={ type } 
         placeholder=' ' 
         value={ value } 
         onChange={ (event) => { setValue(event.target.value); } } 
      />
         <label htmlFor={ name }> { name.charAt(0).toUpperCase() + name.slice(1) } </label>
      </div>
   )
}



export function AuthenticationFormCheckBox({ ref, name }: { ref: Ref<TypeDataHandle<boolean>>, name: string }) {

   const [ value, setValue ] = useState<boolean>(false);

   useImperativeHandle(ref, () => ({
      getData: async () => value,
      setData: async (value) => { setValue(value) },
   }),[value]);

   return (
      <div className={styles.checkboxWrapper}>
         <input 
         type="checkbox"
         name={ name }
         id={ name }
         value="1"
         checked={ value }
         onChange={(event) => setValue(event.target.checked) }
      />
         <label htmlFor={ name }>{ name.charAt(0).toUpperCase() + name.slice(1) }</label>
      </div>
   )
}



export function AuthenticationFormSubmitButton({ children, successMessage }: { children: string, successMessage?: string }) {
   const { success, hasError, error } = useContext(AuthenticationFormErrorContext);

   return (
      <>
         <ButtonOval
            name="Submit"
            type="submit"
            id="submitButton"
            style={ { margin: '0rem', width: '100%', padding: '0.6rem 2rem' } }
            showLoading={ true }
         >
            { children }
         </ButtonOval>

         { hasError && <StateErrorInsert style={ { margin: '0.6rem 0rem' } } error={ error as Error } /> }
         { (successMessage && success) && <StateInfoInsert style={ { margin: '0.6rem 0rem' } }>{ successMessage }</StateInfoInsert> }
      </>
   )
}