import type { AuthorizationService } from "../authorization.service";

//* Base class for anything that uses an authorization based decorator.
//? `authorization` is visible to the class and its subclasses.
export abstract class AccessControlled {
   protected readonly authorization: AuthorizationService;

   constructor({ authorizationService }: { authorizationService: AuthorizationService }) {
      this.authorization = authorizationService;
   }
}