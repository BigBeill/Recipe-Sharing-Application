import { Schema, Types, model, type HydratedDocument, type InferSchemaType } from 'mongoose';
import { ImageSchema } from './image.schema';
import type { NutritionType } from '../../../modules/recipes/recipes.types';
import type { ImageType } from '../../../modules/images/images.types';

interface TypeTimestamps {
   createdAt: Date;
   updatedAt: Date;
}

interface TypeDatabaseIngredient {
    _id: number;
    label: string;
    portion: { _id: number, amount: number }
}

interface TypeDatabaseRecipe {
    ownerId: Types.ObjectId;
    title: string;
    description: string;
    image?: ImageType;
    ingredientList: TypeDatabaseIngredient[];
    instructionList: string[];
    nutrition: NutritionType;
    visibility: 'public' | 'private' | 'personal';
}



const portionSchema = new Schema({
    _id: { type: Number, required: true },
    amount: { type: Number, required: true },
});



const ingredientSchema = new Schema({
    _id: { type: Number, required: true },
    label: { type: String, allowNull: false },
    portion: { type: portionSchema, required: true }
});

type IngredientSchemaType = InferSchemaType<typeof ingredientSchema>;
export type IngredientRecord = IngredientSchemaType;



const nutritionSchema = new Schema({
    calories: { type: Number, required: true },
    fat: { type: Number, required: true },
    cholesterol: { type: Number, required: true },
    sodium: { type: Number, required: true },
    potassium: { type: Number, required: true },
    carbohydrates: { type: Number, required: true },
    fibre: { type: Number, required: true },
    sugar: { type: Number, required: true },
    protein: { type: Number, required: true },
});



const recipeSchema = new Schema<TypeDatabaseRecipe & TypeTimestamps>({
    ownerId: { type: Schema.Types.ObjectId, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: ImageSchema, default: undefined, set: (v: unknown) => (v === null ? undefined : v), },
    ingredientList: { type: [ingredientSchema], required: true },
    instructionList: { type: [String], required: true },
    nutrition: { type: nutritionSchema, required: true },
    visibility: { type: String, enum: ['public', 'private', 'personal'], default: 'public' },
}, { timestamps: true });

export type RecipeDocument = HydratedDocument<TypeDatabaseRecipe & TypeTimestamps>;
export type RecipeRecord = TypeDatabaseRecipe & TypeTimestamps & { _id: Types.ObjectId };

export const RecipeModel = model<TypeDatabaseRecipe & TypeTimestamps>('Recipe', recipeSchema);