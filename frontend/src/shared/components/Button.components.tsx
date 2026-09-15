'use client'

import styles from './styles/buttons.module.scss';
import Spinner from './icons/spinner';
import { useState } from 'react';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLoading } from '../hooks/loadingContext';


export type ButtonIconType = React.ComponentPropsWithoutRef<'button'> & {
   icon: IconDefinition;
   label: string; // needed for accessibility
}

interface ButtonIconListProps {
   iconList: ButtonIconType[];
   showLoading?: boolean;
}

export function ButtonIconList ({ iconList, showLoading = false }: ButtonIconListProps) {
   const isLoading = showLoading && useLoading();
   return (
      <div className={isLoading ? 'hidden' : undefined}>
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
   showLoading?: boolean;
};

export function ButtonOval({ children, className, showLoading = false, ...rest }: ButtonOvalProps) {
   const isLoading = showLoading && useLoading();
   return (
      <button className={[styles.buttonOval, isLoading && styles.loadingState, className].filter(Boolean).join(' ') } { ...rest }>
         { isLoading ? <Spinner /> : children }
      </button>
   );
}



interface ButtonShieldedProps {
   message: string,
   onClick: () => void,
   showLoading?: boolean
}

export function ButtonShielded({ message, onClick, showLoading = false }: ButtonShieldedProps) {
   const [shielded, setShielded] = useState<boolean>(true);

   function attemptOnClick() {
      if (shielded) { setShielded(false); }
      else { onClick(); }
   }

   return (
      <div className={ [styles.buttonShielded, shielded && styles.shielded].filter(Boolean).join(' ') } >
         <ButtonOval showLoading={ showLoading } onClick={ attemptOnClick }>{ shielded ? message : `confirm ${ message }` }</ButtonOval>
         <ButtonOval onClick={ () => setShielded(true) }>Cancel</ButtonOval>
      </div>
   );
}
