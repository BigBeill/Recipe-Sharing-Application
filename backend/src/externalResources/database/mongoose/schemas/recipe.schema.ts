import { Schema, Types, model, type HydratedDocument, type InferSchemaType, type Require_id, type SchemaDefinitionProperty } from 'mongoose';
import type { TypeNutrition, TypeRecipeDraft } from '../../../../features/recipes/domain/recipes.types';
import type { TypeIngredient } from '../../../../features/ingredients/domain/ingredients.types';



export type RecordPortionDraft = Omit<TypeIngredient['portion'], 'description'>;

export type RecordIngredientDraft = Omit<TypeIngredient, 'description' | 'commonName' | 'portion'> & {
    portion: RecordPortionDraft;
}

export type RecordNutritionDraft = TypeNutrition;

export type RecordRecipeDraft = Omit<TypeRecipeDraft, 'imageReference' | 'ingredientList'> & {
    ownerId: Types.ObjectId;
    imageReferenceId?: Types.ObjectId;
    ingredientList: RecordIngredientDraft[];
    nutrition: RecordNutritionDraft;
}



const portionDefinition = {
    _id: { type: Number, required: true },
    amount: { type: Number, required: true },
} as const satisfies Record<keyof RecordPortionDraft, SchemaDefinitionProperty>;

const portionSchema = new Schema(portionDefinition, { _id: false });
export type RecordPortion = InferSchemaType<typeof portionSchema>



const ingredientDefinition = {
    _id: { type: Number, required: true },
    label: { type: String, validate: { validator: (v: unknown) => v !== null, message: 'label cannot be null' } },
    portion: { type: portionSchema, required: true }
} as const satisfies Record<keyof RecordIngredientDraft, SchemaDefinitionProperty>;

const ingredientSchema = new Schema(ingredientDefinition, { _id: false });
export type RecordIngredient = InferSchemaType<typeof ingredientSchema>;



const nutritionDefinition = {
    calories: { type: Number, required: true },
    fat: { type: Number, required: true },
    cholesterol: { type: Number, required: true },
    sodium: { type: Number, required: true },
    potassium: { type: Number, required: true },
    carbohydrates: { type: Number, required: true },
    fibre: { type: Number, required: true },
    sugar: { type: Number, required: true },
    protein: { type: Number, required: true },
} as const satisfies Record<keyof RecordNutritionDraft, SchemaDefinitionProperty>;

const nutritionSchema = new Schema(nutritionDefinition, { _id: false });
export type RecordNutrition = InferSchemaType<typeof nutritionSchema>;



const recipeDefinition = {
    ownerId: { type: Schema.Types.ObjectId, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageReferenceId: { type: Schema.Types.ObjectId },
    ingredientList: { type: [ingredientSchema], required: true, validate: { validator: (v: unknown[]) => v.length > 0, message: 'ingredientList cannot be empty' } },
    instructionList: { type: [String], required: true, validate: { validator: (v: unknown[]) => v.length > 0, message: 'instructionList cannot be empty' } },
    nutrition: { type: nutritionSchema, required: true },
    visibility: { type: String, enum: ['public', 'private', 'personal'], default: 'public' },
} as const satisfies Record<keyof RecordRecipeDraft, SchemaDefinitionProperty>;

const recipeSchema = new Schema(recipeDefinition, { timestamps: true });
export type RecordRecipe = Require_id<InferSchemaType<typeof recipeSchema>>;
export type DocumentRecipe = HydratedDocument<RecordRecipe>;

export const ModelRecipe = model<RecordRecipe>('Recipe', recipeSchema);