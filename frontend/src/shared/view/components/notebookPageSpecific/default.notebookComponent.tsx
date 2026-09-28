import styles from './styles/default.module.scss';
import { ComponentPropsWithoutRef } from "react";

// * Default wrapper for any component that is designed to be plugged directly into @/shared/view/pages/notebook.page.tsx
export function NotebookComponentDefault({ children, className, ...rest }: ComponentPropsWithoutRef<'div'>) {
   
   return (
      <div className={ [styles.wrapper, className].filter(Boolean).join(' ') } { ...rest } >
         { children }
      </div>
   );
}