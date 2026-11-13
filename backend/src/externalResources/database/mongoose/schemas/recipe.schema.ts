import { Schema, Types, model, type HydratedDocument, type InferSchemaType, type Require_id, type SchemaDefinitionProperty } from 'mongoose';
import type { TypeNutrition, TypeRecipe, TypeRecipeDraft } from '../../../../features/recipes/domain/recipes.types';
import type { TypeIngredient } from '../../../../features/ingredients/domain/ingredients.types';
import type { DraftOf } from '../record.types';


// ? a version of { TypeIngredient.portion } that has been modified to fit what mongoose wants
export type ModifiedTypePortion = Omit<TypeIngredient['portion'], 'description'>;

// ? the actual definition of portion used by the mongoose
const portionDefinition = {
    _id: { type: Number, required: true },
    amount: { type: Number, required: true },
} as const satisfies Record<keyof ModifiedTypePortion, SchemaDefinitionProperty>;

const portionSchema = new Schema(portionDefinition, { _id: false });
export type RecordPortion = InferSchemaType<typeof portionSchema>



// ? a version of { TypeIngredient } that has been modified to fit what mongoose wants
type ModifiedTypeIngredient = Omit<TypeIngredient, 'description' | 'commonName' | 'portion'> & {
    portion: ModifiedTypePortion;
};

// ? the actual definition of ingredient used by the mongoose
const ingredientDefinition = {
    _id: { type: Number, required: true },
    label: { type: String, validate: { validator: (v: unknown) => v !== null, message: 'label cannot be null' } },
    portion: { type: portionSchema, required: true }
} as const satisfies Record<keyof ModifiedTypeIngredient, SchemaDefinitionProperty>;

const ingredientSchema = new Schema(ingredientDefinition, { _id: false });
export type RecordIngredient = InferSchemaType<typeof ingredientSchema>;



// ? a version of { TypeNutrition } that has been modified to fit what mongoose wants
type ModifiedTypeNutrition = TypeNutrition;

// ? the actual definition of nutrition used by the mongoose
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
} as const satisfies Record<keyof ModifiedTypeNutrition, SchemaDefinitionProperty>;

const nutritionSchema = new Schema(nutritionDefinition, { _id: false });
export type RecordNutrition = InferSchemaType<typeof nutritionSchema>;



// ? a version of { TypeRecipe } that has been modified to fit what mongoose wants
type ModifiedTypeRecipe = Omit<TypeRecipe, '_id' | 'signedImageUrl' | 'ingredientList'> & {
    imageReferenceId: Types.ObjectId[];
    ingredientList: ModifiedTypeIngredient[];
}

// ? the actual definition of recipe used by the mongoose
const recipeDefinition = {
    ownerId: { type: Schema.Types.ObjectId, required: true, immutable: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageReferenceId: { type: Schema.Types.ObjectId },
    ingredientList: { type: [ingredientSchema], required: true, validate: { validator: (v: unknown[]) => v.length > 0, message: 'ingredientList cannot be empty' } },
    instructionList: { type: [String], required: true, validate: { validator: (v: unknown[]) => v.length > 0, message: 'instructionList cannot be empty' } },
    nutrition: { type: nutritionSchema, required: true },
    visibility: { type: String, enum: ['public', 'private', 'personal'], default: 'public' },
} as const satisfies Record<keyof ModifiedTypeRecipe, SchemaDefinitionProperty>;

const recipeSchema = new Schema(recipeDefinition, { timestamps: true });
export type RecordRecipe = Require_id<InferSchemaType<typeof recipeSchema>>;
export type DocumentRecipe = HydratedDocument<RecordRecipe>;

export const ModelRecipe = model<RecordRecipe>('Recipe', recipeSchema);






// ? Record drafts (for use by services)

export type RecordRecipeDraft = DraftOf<Omit<RecordRecipe, 'ownerId' | 'ingredientList' > & {
        ingredientList: RecordIngredientDraft[];
    }>;
export type RecordNutritionDraft = RecordNutrition;
export type RecordIngredientDraft = RecordIngredient;
export type RecordPortionDraft = RecordPortion;