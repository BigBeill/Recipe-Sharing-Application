"use client"

import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import styles from './styles/popupModal.module.scss'

export function PopupModal({ children }: { children: React.ReactNode }) {
   const dialogRef = useRef<HTMLDialogElement>(null);
   const [entered, setEntered] = useState(false);
   const [closing, setClosing] = useState(false);
   const router = useRouter();

   useEffect(() => {
      const dialog = dialogRef.current;
      const trigger = document.activeElement as HTMLElement | null;

      dialog?.showModal();
      const raf = requestAnimationFrame(() => setEntered(true));

      return () => {
         cancelAnimationFrame(raf);
         dialog?.close();
         trigger?.focus();
      }
   }, []);

   return (
      <dialog 
         ref={ dialogRef }
         className={ styles.popup } 
         tabIndex={ -1 }
         onCancel={ (event) => { event.preventDefault(); router.back(); } }
         onClick={ (event) => { if (event.target === dialogRef.current) { setClosing(true); } } }  
      >
         <div
            className={`${styles.componentWrapper} ${entered && !closing ? styles.open : ''}`}
            onTransitionEnd={ (event) => {
               if (event.target !== event.currentTarget || event.propertyName !== 'transform') { return; }
               if (closing) { router.back(); }
            } }
         >
            { children }
         </div>
      </dialog>
   );
}