'use client'

import styles from './styles/buttons.module.scss';
import Spinner from './icons/spinner';
import { useState } from 'react';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


export type ButtonIconType = React.ComponentPropsWithoutRef<'button'> & {
   icon: IconDefinition;
   label: string; // needed for accessibility
}

interface ButtonIconListProps {
   iconList: ButtonIconType[];
   loadingState?: boolean;
}

export function ButtonIconList ({ iconList, loadingState = false }: ButtonIconListProps) {
   return (
      <div className={loadingState ? 'hidden' : undefined}>
         { iconList.map(({ icon, label, ...rest }) => (
            <button key={ label } aria-label={ label } { ...rest } >
               <FontAwesomeIcon icon={ icon } />
            </button>
         )) }
      </div>
   );
}



export function ButtonInline ({ children, ...rest }: React.ComponentPropsWithoutRef<'button'>) {
   return (
      <button className={ styles.buttonInline } { ...rest }>{ children }</button>
   );
}



interface ButtonNarrowNavParams {
   navOpen: boolean,
   onClick: () => void
}

export function ButtonNarrowNav({ navOpen, onClick }: ButtonNarrowNavParams ) {

   return (
      <button type="button" className={ styles.buttonNarrowNav } onClick={ onClick } >
         <span>Open navigation</span>
         <svg
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
         >
            {navOpen ? (
               <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
               <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
         </svg>
      </button>
   )
}



type ButtonOvalProps = React.ComponentPropsWithoutRef<'button'> & {
   loadingState?: boolean;
};

export function ButtonOval({ children, loadingState, ...rest }: ButtonOvalProps) {
   const { className, ...domProps } = rest;
   return (
      <button className={[styles.buttonOval, loadingState && styles.loadingState, className].filter(Boolean).join(' ') } { ...domProps }>
         { loadingState ? <Spinner /> : children }
      </button>
   );
}



interface ButtonShieldedProps {
   message: string,
   onClick: () => void,
   loadingState?: boolean
}

export function ButtonShielded({ message, onClick, loadingState }: ButtonShieldedProps) {
   const [shielded, setShielded] = useState<boolean>(true);

   function attemptOnClick() {
      if (shielded) { setShielded(false); }
      else { onClick(); }
   }

   return (
      <div className={ [styles.buttonShielded, shielded && styles.shielded].filter(Boolean).join(' ') } >
         <ButtonOval loadingState={ loadingState } onClick={ attemptOnClick }>{ shielded ? message : `confirm ${ message }` }</ButtonOval>
         <ButtonOval onClick={ () => setShielded(true) }>Cancel</ButtonOval>
      </div>
   );
}
