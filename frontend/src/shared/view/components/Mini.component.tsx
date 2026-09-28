import React from "react";
import styles from './styles/mini.module.scss';

export default function MiniComponent ({ children }: { children: React.ReactNode }) {
   return (
      <div className={ styles.mini }>
         { children }
      </div>
   )
}
