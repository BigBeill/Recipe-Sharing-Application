import React from "react";
import Styles from './crooked.module.scss'

export default function AnimationCrooked ({ children }: { children: React.ReactNode }) {

   return (
      <div className={Styles.crookedAnimation}>
         { children }
      </div>
   )
}