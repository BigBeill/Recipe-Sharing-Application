"use client"

import { createPortal } from 'react-dom';
import { DataHandle } from '../shared.types';
import styles from './styles/fullscreen.module.scss'
import { Ref, useEffect, useImperativeHandle, useState } from "react";
import { ButtonIconList } from './Button.components';
import { faXmarkCircle } from '@fortawesome/free-regular-svg-icons';

type ComponentParams = React.ComponentPropsWithoutRef<'div'> & {
   ref: Ref<DataHandle<boolean>>,
}

export function Fullscreen({ ref, children, className, ...rest }: ComponentParams) {
   const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
   const [fullscreen, setFullscreen] = useState<boolean>(false);

   useImperativeHandle(ref, () => ({
      getData: () => fullscreen,
      setData: setFullscreen
   }), [fullscreen]);

   useEffect(() => {
      setPortalRoot(document.getElementsByTagName('body')[0]);
   }, []);

   useEffect(() => {
      if(!fullscreen) return;

      const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { setFullscreen(false) }  };
      window.addEventListener('keydown', onKey);

      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => { 
         window.removeEventListener('keydown', onKey);
         document.body.style.overflow = prev; 
      };
   }, [fullscreen]);

   if (!fullscreen || !portalRoot) { return null; }

   return createPortal(
      <div className={ styles.fullscreenWrapper } { ...rest }>
         { children }
         <ButtonIconList 
            iconList={ [
               { 
                  icon: faXmarkCircle, 
                  label: "exit fullscreen", 
                  onClick: () => { setFullscreen(false) },
                  className: styles.escapeButton,
               }
            ] } 
         />
      </div>,
      portalRoot
   )
}