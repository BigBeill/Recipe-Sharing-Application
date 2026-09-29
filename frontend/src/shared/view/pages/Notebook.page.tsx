'use client'

import React, { useState, useEffect } from 'react';
import PaginationBar from '@/shared/view/components/PaginationBar.component';
import styles from './styles/notebook.module.scss';
import { useSearchParams } from 'next/navigation';
import { BrokenPaginatedListType } from '@/shared/domain/shared.types';
import { StateLoadingInsert } from '../states/Loading.states';

/* 
   * NotebookPage takes multiple mini components and displays them in a notebook format (2 components visible at a time).
   * Components are injected using the { components } prop. (in the form of a { BrokenPaginatedList<React.ReactNode> })

   ? For reference when building { components } prop
   ? components: {
   ?    list: React.ReactNode[]   // the components that are actually getting displayed inside notebook
   ?    count: number   // how many components (through list) you want notebook to assume exist (wether or not they exist inside list at this exact moment)
   ?    firstItemIndex: number   // the index of { list[0] } relative to all the components that can possibly exist (if 10 components can exist, but only the last 2 exist inside of list at the current moment, this value would be 8)
   ? }

   * The url param { page } is used to announce what set of components are being looked at (no param shown means page is just 1)
   *    { page=1 } means components at index 0 and 1 is being shown
   *    { page=2 } means components at index 2 and 3 is being shown
   *    { page=3 } means components at index 4 and 5 is being shown

   * If NotebookPage needs to show a component that does not exist inside { components.list }
   *    It will set { page } to the appropriate value
   *    It will use { <StateLoadingInsert /> } as a temporary placeholder while the parent updates { components.list } 
*/


// ? Each component in components.list is given an entry. (meta data for the component)
interface NotebookEntry {
   key: React.Key;
   component: React.ReactNode;
   side: 0 | 1; // ? dictate where on the notebook this component should show up. (0 = left of spine, 1= right of spine)
   visible: boolean;
}

interface PageProps {
   components: BrokenPaginatedListType<React.ReactNode>
}

export default function NotebookPage ({ components }: PageProps) {

   const searchParams = useSearchParams();
   const page = Number(searchParams.get('page')) || 1;

   const currentIndex = (page - 1) * 2;

   function sideOf(absolute: number): 0 | 1 {
      return (absolute % 2) as 0 | 1;
   }

   // * Load every component into a { notebookEntry }
   const entries: NotebookEntry[] =[];
   components.list.forEach((component, index) => {
      if (!component) { return; }
      const absolute = components.firstItemIndex + index;
      entries.push({ 
         key: absolute,
         component,
         side: sideOf(absolute),
         visible: absolute === currentIndex || absolute === currentIndex + 1,
      })
   })

   for (const absolute of [currentIndex, currentIndex + 1]) {
      const loaded = !!components.list[absolute - components.firstItemIndex];
      if (!loaded && absolute < components.count) {
         entries.push({ key: `loading-${ absolute }`, component: <StateLoadingInsert />, side: sideOf(absolute), visible: true });
      }
   }

   const paginationBar = (components.count <= 2) ? undefined : <PaginationBar pageCount={ Math.ceil(components.count / 2) } />;
   
   return <NotebookView entries={ entries } paginationBar={ paginationBar } />;
}






interface ViewProps {
   entries: NotebookEntry[];
   paginationBar?: React.ReactNode;
}
function NotebookView({ entries, paginationBar }: ViewProps) {

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

   function renderSide(side: 0 | 1) {
      return entries.filter((entry) => { return entry.side === side })
      .map((entry) => (
         <div key={ entry.key } hidden={ !entry.visible } style={ { width: '100%', height: '100%' } }>
            { entry.component }
         </div>
      ))
   }

   return(
      <section className={ styles.pageWrapper }>
         <div className={`${ styles.componentsWrapper } ${ displayRight ? styles.displayRight : '' }`}>
            <div className={`${ styles.component } ${ (displayRight && narrowScreen) ? 'shielded' : '' }`} onClick={ () => setDisplayRight(false) }>
               { renderSide(0) }
            </div>
            <img className={ styles.spine } src="/notebookSpine.png" alt="notebookSpine" />
            <div className={`${ styles.component } ${ (!displayRight && narrowScreen) ? 'shielded' : '' }`} onClick={ () => setDisplayRight(true) }>
               { renderSide(1) }
            </div>
         </div>
         { paginationBar }
      </section>
   )
}






export function NotebookSkelton() {
   return (
      <NotebookView entries={ [{ 
         key: 1,
         component: <StateLoadingInsert />,
         side: 0,
         visible: true,
      }] }/>
   )
}