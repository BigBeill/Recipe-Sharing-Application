import { createContainer, asClass } from "awilix";
import { AuthRepository } from "./features/auth/auth.repository";
import { RecipesRepository } from "./features/recipes/infrastructure/recipes.repository";
import { AuthService } from "./features/auth/auth.service";
import { ImagesService } from "./features/images/images.service";
import { RecipesService } from "./features/recipes/application/recipes.service";
import { UsersService } from "./features/users/application/users.service";
import { IngredientsRepository } from "./features/ingredients/infrastructure/ingredients.repository";
import { IngredientsService } from "./features/ingredients/application/ingredients.service";
import { PermissionsService } from "./features/permissions/permissions.service";
import { UsersRepository } from "./features/users/infrastructure/users.repository";

const container = createContainer();

container.register({
  authRepository: asClass(AuthRepository).singleton(),
  recipesRepository: asClass(RecipesRepository).singleton(),
  usersRepository: asClass(UsersRepository).singleton(),
  ingredientsRepository: asClass(IngredientsRepository).singleton(),
  authService: asClass(AuthService).singleton(),
  imagesService: asClass(ImagesService).singleton(),
  recipesService: asClass(RecipesService).singleton(),
  usersService: asClass(UsersService).singleton(),
  ingredientsService: asClass(IngredientsService).singleton(),
  permissionsService: asClass(PermissionsService).singleton(),
});

export const authService = container.resolve<AuthService>("authService");
export const imagesService = container.resolve<ImagesService>("imagesService");
export const recipesService = container.resolve<RecipesService>("recipesService");
export const usersService = container.resolve<UsersService>("usersService");
export const ingredientsService = container.resolve<IngredientsService>("ingredientsService");
export const permissionsService = container.resolve<PermissionsService>("permissionsService");