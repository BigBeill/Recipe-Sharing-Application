import { ErrorNotFound } from "@/shared/domain/errorClasses";
import StateErrorPage from "@/shared/view/states/Error.states";

export default async function NotFoundPage() {

   return <StateErrorPage error={ new ErrorNotFound("Our server was unable to locate the requested recipe (recipe may have been deleted)") } />
}