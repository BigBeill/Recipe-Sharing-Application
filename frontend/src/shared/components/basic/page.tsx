import styles from './styles/page.module.scss';
import React from "react";

export default function BasicPage ({ children, className, ...rest }: React.ComponentPropsWithoutRef<'div'>) {
   return <div className={ [styles.wrapper, className].filter(Boolean).join(' ') } { ...rest }>{ children }</div>
}