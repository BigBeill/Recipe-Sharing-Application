import { UnauthorizedError } from "../../../global/departingData/errorClasses";
import type { AuthorizationService, ReauthenticationProof } from "../authorization.service";
import type { AccessControlled } from "./AccessControlled.function";

type RequireAccessControlled<This> = This extends AccessControlled ? unknown : "@Reauthenticate can only be used in a class that extends AccessControlled";

//* Requires the client to have reauthenticated during this request before the method runs
//? The method's first parameter must be the ReauthenticationProof returned by authorization.reauthenticate()
export function Reauthenticate<This extends object, Args extends [ReauthenticationProof, ...unknown[]], R>(
   target: (this: This, ...args: Args) => Promise<R>,
   context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Promise<R>> & RequireAccessControlled<This>
) {
   const methodName = String(context.name);

   return async function (this: This, ...args: Args): Promise<R> {
      //? protected is compile-time only; the AccessControlled base class guarantees this exists at runtime
      const { authorization } = this as unknown as { authorization: AuthorizationService };

      if (!authorization.reauthenticated) { throw new UnauthorizedError(`${this.constructor.name}.${methodName} requires the client to reauthenticate first`); }
      return target.apply(this, args);
   };
}