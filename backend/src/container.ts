import { createContainer, asClass, InjectionMode } from "awilix";
import { AuthRepository } from "./modules/auth/auth.repository";
import { RecipesRepository } from "./modules/recipes/recipes.repository";
import { UsersRepository } from "./modules/users/users.repository";
import { AuthService } from "./modules/auth/auth.service";
import { ImagesService } from "./modules/images/images.service";
import { RecipesService } from "./modules/recipes/recipes.service";
import { UsersService } from "./modules/users/users.service";
import { IngredientsRepository } from "./modules/ingredients/ingredients.repository";
import { IngredientsService } from "./modules/ingredients/ingredients.service";
import { PermissionsService } from "./modules/permissions/permissions.service";

const container = createContainer({ injectionMode: InjectionMode.CLASSIC });

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