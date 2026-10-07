import { ComponentPropsWithoutRef } from 'react';
import styles from './styles/info.module.scss';

type Props = ComponentPropsWithoutRef<'div'> & {
   children: React.ReactNode;
}

export function StateInfoInsert ({ children, className, ...rest }: Props) {
   return (
      <div className={ [styles.insertWrapper, className].filter(Boolean).join(' ') } { ...rest }>
         <p className={ styles.insert } aria-live='assertive'>{ children }</p>
      </div>
   );
}