import { NotFoundError } from "../../common/types/error.types";
import type paginationParams from "../../common/parameters/pagination.parameters";
import type { PaginatedListType } from "../../common/types/return.types";
import postgresConnection from "../../config/postgres.database";
import type { IngredientConversionType, IngredientGroupType, IngredientType } from "./ingredients.types";
import { postgresQueryBuilder } from "./ingredients.utils";

interface GetGroupListParams extends paginationParams {
   description?: string,
}

interface GetIngredientList extends paginationParams {
   description?: string,
   food_group_id?: number;
}

export class IngredientsRepository {

   async getBaseNutrition(ingredient_id: number): Promise<{ calories: number, fat: number, cholesterol: number, sodium: number, potassium: number, carbohydrates: number, fibre: number, sugar: number, protein: number }> {
      const { content } = await postgresQueryBuilder(`SELECT nutrient_id, value FROM nutrient_amount`, {
         where: [
            { column: 'food_id', operation: '=', value: ingredient_id.toString() },
            { column: 'nutrient_id', operation: 'IN', value: [203, 204, 205, 208, 269, 291, 306, 307, 601] }
         ],
         order: { column: 'nutrient_id', direction: 'ASC' }
      });

      // make sure all nutrientRows have been found, if any are missing set them to 0
      if (!content[0] || content[0].nutrient_id != 203) { content.splice(0, 0, { nutrient_id: '203', value: '0' } ); }
      if (!content[1] || content[1].nutrient_id != 204) content.splice(1, 0, { nutrient_id: '204', value: '0' } );
      if (!content[2] || content[2].nutrient_id != 205) content.splice(2, 0, { nutrient_id: '205', value: '0' } );
      if (!content[3] || content[3].nutrient_id != 208) content.splice(3, 0, { nutrient_id: '208', value: '0' } );
      if (!content[4] || content[4].nutrient_id != 269) content.splice(4, 0, { nutrient_id: '269', value: '0' } );
      if (!content[5] || content[5].nutrient_id != 291) content.splice(5, 0, { nutrient_id: '291', value: '0' } );
      if (!content[6] || content[6].nutrient_id != 306) content.splice(6, 0, { nutrient_id: '306', value: '0' } );
      if (!content[7] || content[7].nutrient_id != 307) content.splice(7, 0, { nutrient_id: '307', value: '0' } );
      if (!content[8]) content.splice(8, 0, { nutrient_id: '601', value: '0' } );

      return {
         calories: Number(content[3]!.value),
         fat: Number(content[1]!.value),
         cholesterol: Number(content[8]!.value),
         sodium: Number(content[7]!.value),
         potassium: Number(content[6]!.value),
         carbohydrates: Number(content[2]!.value),
         fibre: Number(content[5]!.value),
         sugar: Number(content[4]!.value),
         protein: Number(content[0]!.value),
      }
   }

   async getConversion(food_id: number, measure_id: number): Promise<IngredientConversionType | null> {
      const [ conversionFactorList, measureList ] = await Promise.all([
         postgresConnection.query(
            'SELECT value FROM conversion_factor WHERE food_id = $1 AND measure_id = $2 LIMIT 1',
            [ food_id, measure_id ] 
         ),
         postgresConnection.query(
            'SELECT description FROM measure WHERE _id = $1 LIMIT 1',
            [ measure_id ]
         )
      ]);
      if (!conversionFactorList.rows[0]) { throw new Error('ingredients.repository.getConversion ran into and issue finding conversion_factor with food_id: ' + food_id + ' and measure_id: ' + measure_id); }
      if (!measureList.rows[0]) { throw new Error('ingredients.repository.getConversion ran into an issue finding measure with _id: ' + measure_id); }

      return {
         food_id,
         measure_id,
         measure_description: measureList.rows[0].description,
         value: conversionFactorList.rows[0].value,
      }
   }

   async getIngredient (_id: number): Promise<IngredientType | null> {
      const { rows } = await postgresConnection.query(
         'SELECT description FROM food WHERE _id = $1 LIMIT 1',
         [ _id ]
      );
      if (!rows[0]) { throw new NotFoundError(`Ingredient with ${_id} not found`) }
      return {
         _id,
         description: rows[0].description
      }
   }

   async searchConversions (food_id: number, { skip = 0, limit }: paginationParams ): Promise<PaginatedListType<IngredientConversionType>> {
      const { content, count } = await postgresQueryBuilder('SELECT food_id, measure_id, value FROM conversion_factor', {
         where: [
            { column: 'food_id', operation: '=', value: food_id.toString() }
         ],
         skip,
         limit,
         includeCount: true
      });
      const ingredientConversionList = await Promise.all(content.map(async conversion => {
         const { rows } = await postgresConnection.query(
            'SELECT description FROM measure WHERE _id = $1 LIMIT 1',
            [ conversion.measure_id ]
         );
         if (!rows[0]) { throw new Error('ingredients.repository.getConversionList ran into an issue finding measure with _id: ' + conversion.measure_id); }
         return {
            food_id: conversion.food_id,
            measure_id: conversion.measure_id,
            measure_description: rows[0].description,
            value: conversion.value,
         }
      }));
      return { list: ingredientConversionList, count: count!, firstItemIndex: skip};
   }

   async searchGroups ({ description, skip = 0, limit }: GetGroupListParams): Promise<PaginatedListType<IngredientGroupType>> {
      const { content, count } = await postgresQueryBuilder<IngredientGroupType & { total_count: string }>('SELECT *, COUNT(*) OVER() AS total_count FROM food_group', {
         where: [
            description && { column: 'description', operation: 'ILIKE', value: `%${description}%` },
         ].filter(Boolean) as { column: string; operation: string; value: string; }[],
         skip,
         limit,
         includeCount: true,
      });

      return { list: content, count: count!, firstItemIndex: skip };
   }

   async  searchIngredients ({ description, food_group_id, skip = 0, limit }: GetIngredientList): Promise<PaginatedListType<IngredientType>> {
      const { content, count } = await postgresQueryBuilder<IngredientType>('SELECT * FROM food', { 
         where: [
            description && { column: 'description', operation: 'ILIKE', value: `%${description}%` },
            food_group_id && { column: 'food_group_id', operation: '=', value: `${food_group_id}` }
         ].filter(Boolean) as { column: string; operation: string; value: string; }[],
         skip: skip,
         limit: limit,
         includeCount: true
      });
      return { list: content, count: count!, firstItemIndex: skip };
   }
}