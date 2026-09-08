import { notFound } from "next/navigation";
import { ErrorNotFound } from "./api/errorClasses";

/*
used to wrap service references before sending page content to the client

example use:
   export default async function ServerRenderedFunction({ variable }: params) {
       const information = await preRenderService(() => { return featureService.get(variable) });

       <Feature>{information}</Feature>
   }
*/

export default async function preRenderService<T>(serviceCall: () => Promise<T>): Promise<T> {
   try { return await serviceCall(); }
   catch (error) {
      if (error instanceof ErrorNotFound) { notFound(); }
      throw error;
   }
}