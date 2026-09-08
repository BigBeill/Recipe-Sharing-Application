import React from "react";
import styles from './spin.module.scss';

export default function AnimationSpin ({ children }: { children: React.ReactNode }) {
   return (
      <div className={ styles.spinAnimation }>
         { children }
      </div>
   )
}