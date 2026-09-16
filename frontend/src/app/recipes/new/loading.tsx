import Notebook from "@/shared/components/Notebook";

/** Shows a notebook placeholder while the new-recipe route streams. */
export default function Loading() {
   return <Notebook components={ { list: [], count: 1, firstItemIndex: 0 } } />
}