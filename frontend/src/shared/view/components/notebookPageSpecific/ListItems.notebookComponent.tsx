import styles from './styles/ListItems.module.scss'
import GrowingText from "../GrowingText.component";
import ImageDisplay from "@/features/images/components/ImageDisplay";
import { LinkBackground } from "../Link.components";
import { TypeImageReference } from '@/features/images/domain/image.types';


// * Default method of displaying a list of items designed to be plugged directly into @/shared/view/pages/notebook.page.tsx

interface Props {
   itemList: {
      title: string;
      imageReference?: TypeImageReference;
      href: string;
   }[];
   defaultListSize?: number;
}

export default function NotebookComponentListItems({ itemList, defaultListSize = 0 }: Props) {

   const blankItems = defaultListSize - itemList.length;

   return (
      <div className={ styles.page }>
         <ul className={ styles.list } >
            { itemList.map((item, index) => (
               <li key={ index } className={ styles.item }>
                  <LinkBackground href={ item.href }>
                     <GrowingText text={ item.title } className={ styles.title } />
                     <div className={ styles.decretiveLine } aria-hidden="true"/>
                     <ImageDisplay imageReference={ item.imageReference } category='recipes' />
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