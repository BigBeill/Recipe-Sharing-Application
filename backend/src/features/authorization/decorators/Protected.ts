//* Requires the client to be authenticated in to utilize a repository resource
//? If the client is not authenticated, throw a generic unauthorized error

import { getScope } from "../../../common/decorators/scopeAware";
import { NotFoundError, UnauthorizedError } from "../../../global/departingData/errorClasses";
import type { AuthorizationService } from "../authorization.service";

//? If resource is not found, throw an unauthorized error, (data mask, protected routes shouldn't tell the client if the resource is real or not)
export function Protected<This extends object, Args extends unknown[], R>(
   target: (this: This, ...args: Args) => Promise<R>,
   context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Promise<R>>
) {
   const methodName = String(context.name);

   return async function (this: This, ...args: Args): Promise<R> {
      const className = this.constructor.name;
      const authorization = getScope(this, "Protected").resolve<AuthorizationService>("authorization");

      if (!authorization.clientId) { throw new UnauthorizedError(`Unauthenticated clients cannot call ${className}.${methodName}`); }
      try { return await target.apply(this, args); }
      catch (error) {
         if (error instanceof NotFoundError) { throw new UnauthorizedError(`Client does not have write access to ${className} with _id ${args[0]}`); }
         throw error;
      }
   };
}