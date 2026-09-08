import styles from './states.module.scss'

interface StateNotFoundProps {
   children?: React.ReactNode;
}

export function StateNotFoundInsert({ children }: StateNotFoundProps) {
   return (
      <div className={ styles.errorInsert }>
         { children ? children : <p> Resource not found.</p> }
      </div>
   )
}

export function StateNotFoundPage({ children }: StateNotFoundProps) {
   return (
      <div className="standardPage">
         <h1>404 - Page Not Found</h1>
         { children ? children : <p>The page you are looking for does not exist.</p> }
      </div>
   )
}