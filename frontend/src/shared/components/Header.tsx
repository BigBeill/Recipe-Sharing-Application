'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './styles/header.module.scss';
import { ButtonNarrowNav } from './Button.components';
import useAuth from '@/features/auth/hooks/useAuth';

interface NavigationNodeType {
   name: string,
   href: string,
}

interface LinePositionType {
   x: number,
   scale: number,
   duration: number,
}

const UNDERLINE_SPEED = 900;
const UNDERLINE_MIN_DURATION = 0.15;
const UNDERLINE_MAX_DURATION = 0.6;

const withDuration = (
   previous: LinePositionType,
   next: { x: number, scale: number },
): LinePositionType => {
   const travel = Math.max(
      Math.abs(next.x - previous.x),
      Math.abs((next.x + next.scale) - (previous.x + previous.scale)),
   );

   return {
      ...next,
      duration: Math.min(
         UNDERLINE_MAX_DURATION,
         Math.max(UNDERLINE_MIN_DURATION, travel / UNDERLINE_SPEED),
      ),
   };
};

export default function Header() {
   const { authId } = useAuth();

   const navigation = useMemo<NavigationNodeType[][]>(() => [
      [
         { name: 'Home', href: '/' },
         { name: 'Recipes', href: '/recipes' },
         { name: 'Ingredients', href: '/ingredients' },
         ...(authId !== null ? [{ name: 'Social', href: '/users' }] : []),
         { name: 'About Project', href: '/about' },
      ],
      [
         ...(authId !== null ? 
            [{ name: 'Profile', href: `/users/${ authId }` }]
         : 
            [
               { name: 'Login', href: '/auth/login' },
               { name: 'Register', href: '/auth/register' },
            ]
         ),
      ]
   ], [authId]);

   const [navOpen, setNavOpen] = useState(false);
   const pathname = usePathname();

   // Longest nav href that prefixes the current pathname, so /recipes/new
   // resolves to /recipes while /users/personal still beats /users
   const activeHref = useMemo(() => {
      let match: string | undefined;

      for (const { href } of navigation.flat()) {
         const hit = href === '/'
            ? pathname === '/'
            : pathname === href || pathname.startsWith(`${href}/`);

         if (hit && (!match || href.length > match.length)) { match = href; }
      }

      return match;
   }, [navigation, pathname]);

   const navRef = useRef<HTMLElement | null>(null);

   const linkRefList = useRef(new Map<string, HTMLAnchorElement | null>());
   const [linePosition, setLinePosition] = useState<LinePositionType>({ x: 0, scale: 0, duration: 0 });

   const redefineLinePosition = useCallback((href: string | undefined) => {
      const nav = navRef.current;
      const activeLink = href ? linkRefList.current.get(href) : null;
      if (!nav || !activeLink) {
         setLinePosition(previous => withDuration(previous, { x: previous.x, scale: 0 }));
         return;
      }

      const navRectangle = nav.getBoundingClientRect();
      const activeLinkRectangle = activeLink.getBoundingClientRect();

      setLinePosition(previous => withDuration(previous, {
         x: activeLinkRectangle.left - navRectangle.left,
         scale: activeLinkRectangle.width,
      }));
   }, []);

   useEffect(() => {
      redefineLinePosition(activeHref);

      let frame = 0;
      const handleResize = () => {
         cancelAnimationFrame(frame);
         frame = requestAnimationFrame(() => redefineLinePosition(activeHref));
      }

      window.addEventListener('resize', handleResize);
      return () => { 
         window.removeEventListener('resize', handleResize); 
         cancelAnimationFrame(frame);
      };
   },[activeHref, redefineLinePosition]);

   return (
      <header className={ styles.header }>

         {/* Navigation */}
         <nav ref={ navRef } className={ `${styles.nav} ${navOpen ? styles.visible : '' }`} >
            { navigation.map((section, index) => (
               <div key={ index } onMouseLeave={ () => redefineLinePosition(activeHref) } >
               { section.map((navigationNode) => (
                  <Link
                     key={ navigationNode.name }
                     href={ navigationNode.href }
                     ref={(element) => { 
                        if(element) { linkRefList.current.set(navigationNode.href, element); } 
                        else { linkRefList.current.delete(navigationNode.href); }
                     } }
                     onMouseEnter={() => redefineLinePosition(navigationNode.href)}
                     onClick={() => setNavOpen(false)}
                     className={ (activeHref === navigationNode.href) ? styles['active-link'] : undefined }
                  >
                     { navigationNode.name }
                  </Link>
               )) }
               </div>
            )) }

            { /* Sliding underline */ }
            <span
               aria-hidden="true"
               className={ styles.navUnderline }
               style={ {
                  transform: `translateX(${linePosition.x}px) scaleX(${linePosition.scale})`,
                  transitionDuration: `${linePosition.duration}s`,
               } }
            />
         </nav>

         <ButtonNarrowNav navOpen={ navOpen } onClick={ () => setNavOpen(!navOpen) } />
            
      </header>
   );
}