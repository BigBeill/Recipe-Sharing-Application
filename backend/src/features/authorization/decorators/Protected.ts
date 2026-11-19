import { NotFoundError, UnauthorizedError } from "../../../global/departingData/errorClasses";
import type { AuthorizationService } from "../authorization.service";
import type { AccessControlled } from "./AccessControlled.function";

type RequireAccessControlled<This> = This extends AccessControlled ? unknown : "@Protected can only be used in a class that extends AccessControlled";

//? If resource is not found, throw an unauthorized error, (data mask, protected routes shouldn't tell the client if the resource is real or not)
export function Protected<This extends object, Args extends unknown[], R>(
   target: (this: This, ...args: Args) => Promise<R>,
   context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Promise<R>> & RequireAccessControlled<This>
) {
   const methodName = String(context.name);

   return async function (this: This, ...args: Args): Promise<R> {
      const className = this.constructor.name;
      //? protected is compile-time only; the AccessControlled base class guarantees this exists at runtime
      const { authorization } = this as unknown as { authorization: AuthorizationService };

      if (!authorization.clientId) { throw new UnauthorizedError(`Unauthenticated clients cannot call ${className}.${methodName}`); }
      try { return await target.apply(this, args); }
      catch (error) {
         if (error instanceof NotFoundError) { throw new UnauthorizedError(`Client does not have write access to ${className} with _id ${args[0]}`); }
         throw error;
      }
   };
}