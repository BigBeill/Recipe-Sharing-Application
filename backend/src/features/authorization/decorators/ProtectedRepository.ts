import { NotFoundError, UnauthorizedError } from "../../../global/departingData/errorClasses";
import type { AuthorizationService } from "../authorization.service";

//* sets up a repository to use the authorization service
//? allows the use of the @Protect wrapper
export abstract class ProtectedRepository {
   abstract readonly resourceName: string;
   readonly authorization: AuthorizationService;

   constructor({ authorization }: { authorization: AuthorizationService }) {
      this.authorization = authorization;
   }

   protected get clientId(): NonNullable<AuthorizationService["id"]> {
      const id = this.authorization.id;
      if (!id) { throw new UnauthorizedError(`Unauthenticated clients cannot access the ${this.resourceName} repository`); }
      return id;
   }
}


//* Requires the client to be authenticated in to utilize a repository resource
//? If the client is not authenticated, throw a generic unauthorized error
//? If resource is not found, throw an unauthorized error, (data mask, protected routes shouldn't tell the client if the resource is real or not)
export function Protected<This extends ProtectedRepository, Args extends unknown[], R>(
   target: (this: This, ...args: Args) => Promise<R>,
   context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Promise<R>>
) {
   const methodName = String(context.name);

   return async function (this: This, ...args: Args): Promise<R> {
      if (!this.authorization.id) { throw new UnauthorizedError(`Unauthenticated clients cannot call the ${this.resourceName} repository ${methodName} function`); }
      try { return await target.apply(this, args); }
      catch (error) {
         if (error instanceof NotFoundError) { throw new UnauthorizedError(`Client does not have write access to ${this.resourceName} with _id ${args[0]}`); }
         throw error;
      }
   };
}