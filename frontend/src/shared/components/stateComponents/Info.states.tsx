import styles from './states.module.scss';

interface StateInfoProps {
   children: React.ReactNode;
}

export function StateInfoInsert ({ children }: StateInfoProps) {
   return (
      <p className={ styles.info } aria-live='assertive'>
         { children }
      </p>
   )
}