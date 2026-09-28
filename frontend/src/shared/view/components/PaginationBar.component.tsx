import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

import styles from './styles/paginationBar.module.scss';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';


interface PaginationBarProps {
   pageCount: number;
}

export default function PaginationBar({ pageCount }: PaginationBarProps) {

   const searchParams = useSearchParams();
   const currentPage = Number(searchParams.get('page')) || 1;
   
   function setPage(page: number) {
      const updatedParams = new URLSearchParams(searchParams.toString())
      updatedParams.set('page', String(page));
      window.history.pushState(null, '', `?${ updatedParams.toString() }`);
   }

   // guard to try and limit out of bounds requests leaving this component
   function handlePageChange(newPage: number) {
      if (newPage < 1) { setPage(1); }
      else if (newPage > pageCount) { setPage(pageCount); }
      else { setPage(newPage); }
   }

   // creates event listener for key presses
   useEffect(() => {
      // changes page if arrow key or a/d is pressed
      function handleKeyDown(event: KeyboardEvent) {
         const focusedElement = (event.target as HTMLElement)?.tagName;
         if (focusedElement === 'INPUT' || focusedElement === 'TEXTAREA') { return; }
         if (event.key == 'a' || event.key == 'ArrowLeft') { handlePageChange(currentPage - 1); }
         if (event.key == 'd' || event.key == 'ArrowRight') { handlePageChange(currentPage + 1); }
      }

      window.addEventListener('keydown', handleKeyDown);
      return () => { window.removeEventListener('keydown', handleKeyDown); }
   }, [currentPage, handlePageChange]);

   return (
      <div className={styles.paginationBar}>
         <button onClick={() => handlePageChange(currentPage - 1)} > <FontAwesomeIcon icon={faArrowLeft} /> </button>
         { currentPage == 4 ? (
            <>
               <button onClick={() => handlePageChange(1)}> 1 </button>
            </>
         ): currentPage > 4 ? (
            <>
               <button onClick={() => handlePageChange(1)}> 1 </button>
               <button onClick={() => handlePageChange(2)}> 2 </button>
            </>
         ) : null }
         { currentPage > 5 ? (<p>...</p>) : null}
         { currentPage > 2 ? (<button onClick={() => handlePageChange(currentPage - 2)}> {currentPage - 2} </button>) : null }
         { currentPage > 1 ? (<button onClick={() => handlePageChange(currentPage - 1)}> {currentPage - 1} </button>) : null }
         <p className="primaryBlock">{currentPage}</p>
         { currentPage < pageCount ?  (<button onClick={() => handlePageChange(currentPage + 1)}> {currentPage + 1} </button>) : null}
         { currentPage < pageCount - 1 ? (<button onClick={() => handlePageChange(currentPage + 2)}> {currentPage + 2} </button>) : null }
         { currentPage < pageCount - 4 ? (<p>...</p>) : null}
         { currentPage == (pageCount - 3)? (
            <>
               <button onClick={() => handlePageChange(pageCount)}> {pageCount} </button>
            </>
         ) : currentPage < (pageCount - 3)? (
            <>
              <button  onClick={() => handlePageChange(pageCount - 1)}> {pageCount - 1} </button>
              <button onClick={() => handlePageChange(pageCount)}> {pageCount} </button> 
            </>
         ) : null}
         <button onClick={() => handlePageChange(currentPage + 1)} > <FontAwesomeIcon icon={faArrowRight} /> </button>
      </div>
   )
}