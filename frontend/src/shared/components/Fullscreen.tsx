"use client"

import { DataHandle } from '../shared.types';
import styles from './styles/fullscreen.module.scss'
import { Ref, useEffect, useImperativeHandle, useState } from "react";

type ComponentParams = React.ComponentPropsWithoutRef<'div'> & {
   ref: Ref<DataHandle<boolean>>,
}

export function Fullscreen({ ref, children, className, ...rest }: ComponentParams) {
   const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
   const [fullscreen, setFullscreen] = useState<boolean>(false);

   useImperativeHandle(ref, () => ({
      getData: () => fullscreen,
      setData: setFullscreen
   }), []);

   useEffect(() => {
      setPortalRoot(document.getElementsByTagName('body')[0]);

      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { setFullscreen(false) }  };
      window.addEventListener('keydown', onKey);
      return () => {
         window.removeEventListener('keydown', onKey);
         document.body.style.overflow = prev;
      };
   }, []);

   if (!portalRoot) { return null; }

   return (
      <div className={ [styles.fullscreenWrapper, ...(fullscreen ? [] : [styles.hidden])].filter(Boolean).join(' ') } role="dialog" aria-modal="true" onClick={() => { setFullscreen(false) } }>
         <div className={ [styles.fullscreenComponent, className].filter(Boolean).join(' ') }>
            { children }
         </div>
      </div>
   )
}