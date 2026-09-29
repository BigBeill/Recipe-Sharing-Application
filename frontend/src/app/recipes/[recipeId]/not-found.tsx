import { ErrorNotFound } from "@/shared/lib/api/errorClasses";
import StateErrorPage from "@/shared/view/states/Error.states";

export default function NotFoundPage() {

   return <StateErrorPage error={ new ErrorNotFound() } />
}