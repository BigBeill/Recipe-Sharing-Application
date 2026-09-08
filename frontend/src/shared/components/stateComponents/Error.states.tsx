interface StateErrorProps {
   children?: React.ReactNode;
}

export default function StateErrorPage({ children }: StateErrorProps) {
   return (
      <div className="standardPage">
         <h1>500 - Issue loading the page</h1>
         { children ? children : <p>Please try again</p> }
      </div>
   )
}