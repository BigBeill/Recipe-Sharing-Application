// not really an animation but it kind of fits here so ill move it later maybe

import React from "react";
import styles from './styles/miniComponent.module.scss';

export default function MiniComponent ({ children }: { children: React.ReactNode }) {
   return (
      <div className={ styles.miniComponent }>
         { children }
      </div>
   )
}