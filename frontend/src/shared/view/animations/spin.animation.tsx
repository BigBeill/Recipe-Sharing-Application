import React from "react";
import styles from './styles/spin.module.scss';

export default function AnimationSpin ({ children }: { children: React.ReactNode }) {
   return (
      <div className={ styles.spinAnimation }>
         { children }
      </div>
   )
}