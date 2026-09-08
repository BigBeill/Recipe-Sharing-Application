import styles from './styles/links.module.scss'
import Link from "next/link"

function isExternal (href: string) { return /^https?:\/\//.test(href); }
function CustomLink ({ children, href, ...rest }: React.ComponentProps<typeof Link> & { href: string }) {
   if (isExternal(href)) {
      return <a href={ href } target="_blank" rel="noopener noreferrer" { ...rest }>{ children }</a>
   }
   else { return <Link href={ href } { ...rest }>{ children }</Link>; }
}



interface LinkBackgroundParams {
   children: React.ReactNode;
   href: string;
}

export function LinkBackground({ children, href }: LinkBackgroundParams) {
   return (
      <CustomLink href={ href } className={ styles.linkBackground }>
         { children }
      </CustomLink>
   )
}



interface LinkPairParams {
   first: { text: string, href: string };
   second: { text: string, href: string };
}

export function LinkPair ({ first, second }: LinkPairParams) {
   return (
      <div className={styles.linkPair}>
         <CustomLink href={ first.href }>{ first.text }</CustomLink>
         <CustomLink href={ second.href }>{ second.text }</CustomLink>
      </div>
   )
}