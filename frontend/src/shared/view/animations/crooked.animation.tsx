import React from "react";
import styles from './styles/crooked.module.scss'

export default function AnimationCrooked ({ children }: { children: React.ReactNode }) {

   return (
      <div className={ styles.crookedAnimation }>
         { children }
      </div>
   )
}