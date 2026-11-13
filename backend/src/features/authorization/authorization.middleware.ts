import Elysia from "elysia";
import { authenticateMiddleware } from "../authentication/authentication.middleware";
import { UnauthorizedError } from "../../global/departingData/errorClasses";

export const authorizeMiddleware = new Elysia({ name: 'authenticate' })
.use(authenticateMiddleware)
.derive(({ authorization }) => {
   if (!authorization.authId) { throw new UnauthorizedError('CLient needs a valid authId to access this endpoint') }
});