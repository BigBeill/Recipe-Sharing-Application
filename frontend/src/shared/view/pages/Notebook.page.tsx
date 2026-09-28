'use client'

import React, { useState, useEffect } from 'react';
import PaginationBar from '@/shared/view/components/PaginationBar.component';
import styles from './styles/notebook.module.scss';
import { useSearchParams } from 'next/navigation';
import { BrokenPaginatedListType } from '@/shared/domain/shared.types';
import { StateLoadingInsert, StateLoadingPage } from '../states/Loading.states';






interface notebookProps {
   components: BrokenPaginatedListType<React.ReactNode>
}

export default function NotebookPage ({ components }: notebookProps) {

   const searchParams = useSearchParams();
   const page = Number(searchParams.get('page')) || 1;

   const currentIndex = (page - 1) * 2;

   // Fetches a component from components.list
   // If the component does not exist return a loading state component or nothing, depending on if the component is within the components.count range
   function grabComponentFromList(index: number) {
      if (components.list[index]) { return components.list[index]; }
      else if (index < components.count) { return <StateLoadingPage /> }
      else { return undefined; }
   }

   // grab the actual component being used.
   const firstComponentIndex = currentIndex - components.firstItemIndex;
   const firstComponent = grabComponentFromList(firstComponentIndex);
   const secondComponent = grabComponentFromList(firstComponentIndex + 1);
   const paginationBar = (components.count <= 2) ? undefined : <PaginationBar pageCount={ Math.ceil(components.count / 2) } />;
   
   return <NotebookView firstComponent={ firstComponent } secondComponent={ secondComponent } paginationBar={ paginationBar } />;
}






interface ViewProps {
   firstComponent?: React.ReactNode;
   secondComponent?: React.ReactNode;
   paginationBar?: React.ReactNode;
}
function NotebookView({firstComponent, secondComponent, paginationBar}: ViewProps) {

   // use States that keep track of whether the screen is too narrow to display both pages at once, and if so which page to display
   const [narrowScreen, setNarrowScreen] = useState<boolean>(false);
   const [displayRight, setDisplayRight] = useState<boolean>(false);

      // monitors the screen size and sets narrowScreen accordingly
   useEffect(() => {

      // check if the screen is too small to support both pages of notebook at once
      function handleResize() {
         const width = window.innerWidth;
         const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
         const threshold = 78 * rootFontSize; // 78rem

         if (width < threshold) { setNarrowScreen(true); }
         else { setNarrowScreen(false); }
      }

      handleResize();

      window.addEventListener('resize', handleResize);
      return () => { window.removeEventListener('resize', handleResize); }
   }, []);

   return(
      <section className={ styles.pageWrapper }>
         <div className={`${ styles.componentsWrapper } ${ displayRight ? styles.displayRight : '' }`}>
            <div className={`${ styles.component } ${ (displayRight && narrowScreen) ? 'shielded' : '' }`} onClick={ () => setDisplayRight(false) }>
               { firstComponent || null }
            </div>
            <img className={ styles.spine } src="/notebookSpine.png" alt="notebookSpine" />
            <div className={`${ styles.component } ${ (!displayRight && narrowScreen) ? 'shielded' : '' }`} onClick={ () => setDisplayRight(true) }>
               { secondComponent || null }
            </div>
         </div>
         { paginationBar }
      </section>
   )
}






export function NotebookSkelton() {
   return (
      <NotebookView firstComponent={ <StateLoadingInsert /> }/>
   )
}