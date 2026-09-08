import { Elysia } from 'elysia';
import { corsConfig } from './config/cors';
import { errorHandler } from './plugins/errorHandler.plugin';
import { logger } from './plugins/logger.plugin';
import { authController } from './modules/auth/auth.controller';
import { usersController } from './modules/users/users.controller';
import removeMongooseNoise from './common/utils/removeMongooseNoise';
import { ingredientsController } from './modules/ingredients/ingredients.controller';
import { imagesController } from './modules/images/images.controller';
import { recipesController } from './modules/recipes/recipes.controller';
import { jwksPlugin } from './modules/auth/jwk.plugin';
import { cookieConfig } from './config/cookies';
import { circuitBreaker } from './plugins/circuitBreaker.plugin';
import { ipRateLimit } from './plugins/ipRateLimit.plugin';

export const app = new Elysia({ normalize: false, cookie: cookieConfig })
   .use(circuitBreaker({ limit: 2000, windowMs: 10_000, cooldownMs: 30_000 }))
   .use(ipRateLimit({ limit: 100, windowMs: 10_000 }))
   .use(errorHandler)
   .use(jwksPlugin)
   .mapResponse({ as: 'global' }, ({ responseValue }) => {
      if (responseValue && typeof responseValue === 'object' && 'data' in responseValue) {
         return new Response(
            JSON.stringify({ data: removeMongooseNoise((responseValue as any).data) }),
            { headers: { 'Content-Type': 'application/json' } }
         );
      }
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