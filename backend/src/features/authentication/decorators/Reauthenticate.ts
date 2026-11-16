import { getScope } from "../../../common/decorators/scopeAware";

export type ReauthenticateParams = { readonly password: string };
type CanVerifyPassword = { verifyPassword(password: string): Promise<void> };

//* Decorator reauthenticate's the user by confirming the resource calling a function can produce the correct password for a users account
//? Function that uses this decorator must have ReauthenticateParams as its first accepted params. eg: customFunction(_reauthenticateParams: ReauthenticateParams, ...)
export function Reauthenticate<This extends object, Args extends [ReauthenticateParams, ...unknown[]], R>(
   target: (this: This, ...args: Args) => Promise<R>,
   _context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Promise<R>>
) {
   return async function (this: This, ...args: Args): Promise<R> {
      const authenticationService = getScope(this, "Reauthenticate").resolve<CanVerifyPassword>("authenticationService");
      await authenticationService.verifyPassword(args[0].password); // throws → original never runs
      return target.apply(this, args);
   };
}