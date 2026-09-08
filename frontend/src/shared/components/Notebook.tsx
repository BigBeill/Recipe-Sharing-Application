'use client'

import React, { useState, useEffect, ComponentPropsWithoutRef } from 'react';
import PaginationBar from '@/shared/components/PaginationBar';
import styles from './styles/notebook.module.scss';
import { useSearchParams } from 'next/navigation';
import { StateLoadingPage } from './stateComponents/Loading.states';
import { BrokenPaginatedListType } from '../shared.types';

interface notebookParams {
   components: BrokenPaginatedListType<React.ReactNode>
}

export default function Notebook ({ components }: notebookParams) {

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
   const paginationBar = (components.count <= 2) ? null : <PaginationBar pageCount={ Math.ceil(components.count / 2) } />;
   
   return <NotebookView firstComponent={ firstComponent } secondComponent={ secondComponent } paginationBar={ paginationBar } />;
}


interface NotebookProps {
   firstComponent?: React.ReactNode;
   secondComponent?: React.ReactNode;
   paginationBar: React.ReactNode;
}
function NotebookView({firstComponent, secondComponent, paginationBar}: NotebookProps) {

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
      <div className={styles.notebookContainer}>
         <section className={`${styles.notebook} ${displayRight ? styles.displayRight : ''}`}>
            <div className={`${styles.page} ${(displayRight && narrowScreen) ? 'shielded' : ''}`} onClick={() => setDisplayRight(false)}>
               {firstComponent || null}
            </div>
            <img className={ styles.spine } src="/notebookSpine.png" alt="notebookSpine" />
            <div className={`${ styles.page } ${(!displayRight && narrowScreen) ? 'shielded' : ''}`} onClick={() => setDisplayRight(true)}>
               {secondComponent || null}
            </div>
         </section>
         { paginationBar }
      </div>
   )
}






// component used as a wrapper for any component designed to fit inside notebook (guarantees size, position and hidden overflow)
export function NotebookPage({ children, className, ...rest }: ComponentPropsWithoutRef<'div'>) {
   
   return (
      <div className={ [styles.notebookPage, className].filter(Boolean).join(' ') } { ...rest } >
         { children }
      </div>
   );
}