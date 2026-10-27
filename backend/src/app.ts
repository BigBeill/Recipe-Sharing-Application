import { Elysia } from 'elysia';
import { authController } from './features/auth/api/auth.controller';
import { usersController } from './features/users/api/users.controller';
import removeMongooseNoise from './common/utils/removeMongooseNoise';
import { ingredientsController } from './features/ingredients/api/ingredients.controller';
import { imagesController } from './features/images/api/images.controller';
import { recipesController } from './features/recipes/api/recipes.controller';
import { jwksPlugin } from './features/auth/jwk.plugin';
import { circuitBreaker } from './global/security/circuitBreaker.root';
import { cookieConfig } from './global/config/cookies.config';
import { ipRateLimit } from './global/security/ipRateLimit.root';
import { errorHandler } from './global/departingData/errorHandler.root';
import { corsConfig } from './global/config/cors.config';
import { logger } from './global/departingData/logger.root';

export const app = new Elysia({ cookie: cookieConfig })
   .use(circuitBreaker({ limit: 2000, windowMs: 10_000, cooldownMs: 30_000 }))
   .use(ipRateLimit({ limit: 100, windowMs: 10_000 }))
   .use(errorHandler)
   .use(jwksPlugin)
   .mapResponse({ as: 'global' }, ({ responseValue }) => {
      return new Response(
         JSON.stringify(removeMongooseNoise(responseValue)),
         { headers: { 'Content-Type': 'application/json' } }
      );
   })
   .use(corsConfig)
   .use(logger)
   .get('/health', () => ({ status: 'ok' }))
   .group('/api/v1', (api) =>
      api
         .use(authController)
         .use(imagesController)
         .use(ingredientsController)
         .use(recipesController)
         .use(usersController),
   );

export type App = typeof app;