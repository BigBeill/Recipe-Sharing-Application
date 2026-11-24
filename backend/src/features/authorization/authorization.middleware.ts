import Elysia from "elysia";
import { authenticateMiddleware } from "../authentication/authentication.middleware";
import { AppErrorUnauthorized } from "../../global/departingData/errorClasses";

export const authorizeMiddleware = new Elysia({ name: 'authenticate' })
.use(authenticateMiddleware)
.derive({ as: 'scoped' }, ({ authorization }) => {
   if (!authorization?.clientId) { throw new AppErrorUnauthorized() }
   return { clientId: authorization.clientId };
});