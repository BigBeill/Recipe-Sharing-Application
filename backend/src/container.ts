import { createContainer, asClass, asValue } from "awilix";
import { AuthenticationRepository } from "./features/authentication/infrastructure/authentication.repository";
import { RecipesRepository } from "./features/recipes/infrastructure/recipes.repository";
import { AuthenticationService } from "./features/authentication/application/authentication.service";
import { ImagesService } from "./features/images/application/images.service";
import { RecipesService } from "./features/recipes/application/recipes.service";
import { UsersService } from "./features/users/application/users.service";
import { IngredientsRepository } from "./features/ingredients/infrastructure/ingredients.repository";
import { IngredientsService } from "./features/ingredients/application/ingredients.service";
import { UsersRepository } from "./features/users/infrastructure/users.repository";
import { ImagesRepository } from "./features/images/infrastructure/images.repository";
import { AuthorizationService } from "./features/authorization/authorization.service";
import { AuthorizationRepository } from "./features/authorization/authorization.repository";
import { RelationshipsRepository } from "./features/relationships/infrastructure/relationships.repository";
import { RelationshipsService } from "./features/relationships/application/relationships.service";

export const container = createContainer({ strict: true });

container.register({
   clientId: asValue<string | null | undefined>(undefined),

   authenticationRepository: asClass(AuthenticationRepository).scoped(),
   authorizationRepository: asClass(AuthorizationRepository).scoped(),
   recipesRepository: asClass(RecipesRepository).scoped(),
   usersRepository: asClass(UsersRepository).scoped(),
   imagesRepository: asClass(ImagesRepository).scoped(),
   ingredientsRepository: asClass(IngredientsRepository).scoped(),
   relationshipsRepository: asClass(RelationshipsRepository).scoped(),

   authenticationService: asClass(AuthenticationService).scoped(),
   authorizationService: asClass(AuthorizationService).scoped(),
   imagesService: asClass(ImagesService).scoped(),
   recipesService: asClass(RecipesService).scoped(),
   usersService: asClass(UsersService).scoped(),
   ingredientsService: asClass(IngredientsService).scoped(),
   relationshipsService: asClass(RelationshipsService).scoped(),
});