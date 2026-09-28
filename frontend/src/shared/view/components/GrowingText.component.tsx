"use client"

import { useEffect, useRef } from 'react';
import styles from './styles/growingText.module.scss'

type GrowingTextProps = React.ComponentPropsWithoutRef<'div'> & {
   text: string;
}

function GrowingText({ text, className, ...rest }: GrowingTextProps) {
   const wrapperRef = useRef<HTMLDivElement>(null);
   const textRef = useRef<HTMLHeadingElement>(null);

   useEffect(() => {
      const wrapper = wrapperRef.current;
      const textElement = textRef.current;
      if (!wrapper || !textElement) { return; }
      
      const MIN = 0.6, MAX = 2.4;

      function fits(size: number) {
         textElement!.style.fontSize = `${size}rem`;
         return textElement!.scrollHeight <= wrapper!.clientHeight && textElement!.scrollWidth <= wrapper!.clientWidth;
      }

      function adjustFontSize() {
         if (!wrapper!.clientHeight || !wrapper!.clientWidth) { return; }

         let low = MIN, high = MAX;
         while ( high - low > 0.05) {
            const mid = (low + high) / 2;
            if (fits(mid)) { low = mid; }
            else { high = mid; }
         }
         textElement!.style.fontSize = `${low}rem`
      }

      adjustFontSize();

      const observer = new ResizeObserver(adjustFontSize);
      observer.observe(wrapper);
      document.fonts?.ready.then(adjustFontSize);

      return () => observer.disconnect();
   }, [text]);

   return (
      <div className={ [styles.wrapper, className].filter(Boolean).join(' ') } ref={ wrapperRef } { ...rest }>
         <h2 className={ styles.text } ref={ textRef }>
            { text }
         </h2>
      </div>
   );
}

export default GrowingText;