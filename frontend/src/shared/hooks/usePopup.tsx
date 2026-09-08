import React, { useCallback, useEffect, useState } from "react";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createPortal } from "react-dom";

export function usePopup(popupComponent: React.ReactNode) {
   const [originalUrl, setOriginalUrl] = useState('');
   const [visible, setVisible] = useState(false);

   useEffect(() => {
      setOriginalUrl(window.location.href);
   }, []);

   function show(url?: string) { 
      setVisible(true);
      if (url) { window.history.pushState({}, '', url); }
   }
   const hide = useCallback(() => {
      setVisible(false);
      if (window.location.href !== originalUrl) { window.history.pushState({}, '', originalUrl); }
   }, [originalUrl]);
   function toggle() {
      if (visible) { hide(); }
      else { show(); }
   }

   const content = visible ? <Popup Component={popupComponent} close={hide} /> : null;

   return { visible, show, hide, toggle, content };
}


// component portion of the hook
interface PopupProps {
   Component: React.ReactNode;
   close: () => void;
}
export default function Popup({Component, close}: PopupProps) {
   const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

   useEffect(() => {
      setPortalRoot(document.getElementsByTagName('body')[0]);

      const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { close(); }  };
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', onKey);
      return () => {
         window.removeEventListener('keydown', onKey);
         document.body.style.overflow = prev;
      };
   }, [close]);

   if (!portalRoot) { return null;}

   return createPortal(
      <div 
         className="displayPopup fadeIn"
         role="dialog"
         aria-modal="true"
         onClick={() => { close() } }
      >
         <div
            className="popupContent slideUp"
            onClick={(event: React.MouseEvent) => { event.stopPropagation(); }}
            aria-label="Popup content"
         >
            {Component}

            <button
               className="closePopupButton"
               aria-label="Close"
               title="Close"
               onClick={() => { close() }}
            >
               <FontAwesomeIcon icon={faXmark} />
            </button>
         </div>
      </div>,
      portalRoot
   );
}