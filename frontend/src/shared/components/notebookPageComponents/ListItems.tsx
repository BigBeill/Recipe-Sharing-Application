import { PackagedImageType } from "@/features/images/domain/image.types";
import styles from './styles/ListItems.module.scss'
import GrowingText from "../GrowingText";
import ImageDisplay from "@/features/images/components/ImageDisplay";
import { LinkBackground } from "../Link.components";



interface ComponentProps {
   itemList: {
      title: string;
      image?: PackagedImageType;
      href: string;
   }[];
   defaultListSize?: number;
}

export default function NotebookPageListItems({ itemList, defaultListSize = 0 }: ComponentProps) {

   const blankItems = defaultListSize - itemList.length;

   return (
      <div className={ styles.page }>
         <ul className={ styles.list } >
            { itemList.map((item, index) => (
               <li key={ index } className={ styles.item }>
                  <LinkBackground href={ item.href }>
                     <GrowingText text={ item.title } className={ styles.title } />
                     <div className={ styles.decretiveLine } aria-hidden="true"/>
                     <ImageDisplay packagedImage={ item.image } />
                  </LinkBackground>
               </li>
            )) }
            { Array.from({ length: blankItems }, (_, index) => (
               <li key={ `blank-${index}` } aria-hidden="true" className={ styles.item }>
                  <span />
               </li>
            )) }
         </ul>
      </div>
   );
}