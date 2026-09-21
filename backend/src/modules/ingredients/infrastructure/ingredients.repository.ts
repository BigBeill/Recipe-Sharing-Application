import { NotFoundError } from "../../../common/types/error.types";
import type paginationParams from "../../../common/parameters/pagination.parameters";
import type { PaginatedListType } from "../../../common/types/return.types";
import postgresConnection from "../../../database/config/postgres.database";
import { postgresQueryBuilder } from "../../../database/postgres/queryBuilder";
import type { TypeIngredient, TypeIngredientConversion, TypeIngredientGroup } from "../domain/ingredients.types";
import { breakupMeasureDescription, calculateTrueConversionFactorValue } from "./ingredients.mapper";

interface GetGroupListParams extends paginationParams {
   description?: string,
}

interface GetIngredientList extends paginationParams {
   description?: string,
   food_group_id?: number;
}

export class IngredientsRepository {



   async getBaseNutrition(ingredient_id: number): Promise<{ calories: number, fat: number, cholesterol: number, sodium: number, potassium: number, carbohydrates: number, fibre: number, sugar: number, protein: number }> {
      const { list } = await postgresQueryBuilder(`SELECT nutrient_id, value FROM nutrient_amount`, {
         where: [
            { column: 'food_id', operation: '=', value: ingredient_id.toString() },
            { column: 'nutrient_id', operation: 'IN', value: [203, 204, 205, 208, 269, 291, 306, 307, 601] }
         ],
         order: { column: 'nutrient_id', direction: 'ASC' }
      });

      // make sure all nutrientRows have been found, if any are missing set them to 0
      if (!list[0] || list[0].nutrient_id != 203) { list.splice(0, 0, { nutrient_id: '203', value: '0' } ); }
      if (!list[1] || list[1].nutrient_id != 204) list.splice(1, 0, { nutrient_id: '204', value: '0' } );
      if (!list[2] || list[2].nutrient_id != 205) list.splice(2, 0, { nutrient_id: '205', value: '0' } );
      if (!list[3] || list[3].nutrient_id != 208) list.splice(3, 0, { nutrient_id: '208', value: '0' } );
      if (!list[4] || list[4].nutrient_id != 269) list.splice(4, 0, { nutrient_id: '269', value: '0' } );
      if (!list[5] || list[5].nutrient_id != 291) list.splice(5, 0, { nutrient_id: '291', value: '0' } );
      if (!list[6] || list[6].nutrient_id != 306) list.splice(6, 0, { nutrient_id: '306', value: '0' } );
      if (!list[7] || list[7].nutrient_id != 307) list.splice(7, 0, { nutrient_id: '307', value: '0' } );
      if (!list[8]) list.splice(8, 0, { nutrient_id: '601', value: '0' } );

      // convert each nutrient from 100 grams to 1 gram
      for (const row of list) { row.value = Number(row.value) / 100; }


      return {
         calories: Number(list[3]!.value),
         fat: Number(list[1]!.value),
         cholesterol: Number(list[8]!.value),
         sodium: Number(list[7]!.value),
         potassium: Number(list[6]!.value),
         carbohydrates: Number(list[2]!.value),
         fibre: Number(list[5]!.value),
         sugar: Number(list[4]!.value),
         protein: Number(list[0]!.value),
      }
   }



   async getConversion(food_id: number, measure_id: number): Promise<TypeIngredientConversion> {

      // get the measure information from postgres
      const measureDescriptionList = await postgresConnection.query( 'SELECT description FROM measure WHERE _id = $1 LIMIT 1', [measure_id ] );
      if (!measureDescriptionList.rows[0]) { throw new NotFoundError('ingredients.repository.getConversion ran into and issue finding measureDescription with measure_id: ' + measure_id); }
      const { number, string } = breakupMeasureDescription(measureDescriptionList.rows[0].description);
      if (string === 'g') { return { food_id, measure_id, value: 1, measure_description: 'g' }; } // if the unit is grams just return with a value of 1(everything is already measured in grams)

      // get the conversion factor information from postgres
      const conversionFactorValueList = await postgresConnection.query( 'SELECT value FROM conversion_factor WHERE food_id = $1 AND measure_id = $2 LIMIT 1', [ food_id, measure_id ] );
      if (!conversionFactorValueList.rows[0]) { throw new NotFoundError('ingredients.repository.getConversion ran into and issue finding conversion_factor with food_id: ' + food_id + ' and measure_id: ' + measure_id); }
      
      return { food_id, measure_id, value: calculateTrueConversionFactorValue(conversionFactorValueList.rows[0].conversion_factor, number), measure_description: string };
   }



   async getMeasureDescription(measure_id: number): Promise<string> {
      const measureDescriptionList = await postgresConnection.query('SELECT description FROM measure WHERE _id = $1 LIMIT 1', [ measure_id ]);
      if (!measureDescriptionList.rows[0]) { throw new NotFoundError("ingredients.repository.getMeasureDescription could not find measure_id: " + measure_id) }
      return measureDescriptionList.rows[0].description;
   }



   async getIngredient (_id: number): Promise<TypeIngredient> {
      const { rows } = await postgresConnection.query('SELECT description FROM food WHERE _id = $1 LIMIT 1', [ _id ]);
      if (!rows[0]) { throw new NotFoundError("ingredients.repository.getIngredient could not find _id: " + _id) }
      return { _id, description: rows[0].description }
   }



   async searchGroups ({ description, skip = 0, limit }: GetGroupListParams): Promise<PaginatedListType<TypeIngredientGroup>> {
      const { list, count } = await postgresQueryBuilder<TypeIngredientGroup & { count: number }>('SELECT * FROM food_group', {
         where: [
            description && { column: 'description', operation: 'ILIKE', value: `%${description}%` },
         ].filter(Boolean) as { column: string; operation: string; value: string; }[],
         skip,
         limit,
         includeCount: true,
      });

      return { list, count: count!, firstItemIndex: skip };
   }



   async  searchIngredients ({ description, food_group_id, skip = 0, limit }: GetIngredientList): Promise<PaginatedListType<TypeIngredient>> {
      const { list, count } = await postgresQueryBuilder<TypeIngredient>('SELECT * FROM food', { 
         where: [
            description && { column: 'description', operation: 'ILIKE', value: `%${description}%` },
            food_group_id && { column: 'food_group_id', operation: '=', value: `${food_group_id}` }
         ].filter(Boolean) as { column: string; operation: string; value: string; }[],
         skip: skip,
         limit: limit,
         includeCount: true
      });
      return { list, count: count!, firstItemIndex: skip };
   }



   async searchConversionOptions (food_id: number, { skip = 0, limit }: paginationParams ): Promise<PaginatedListType<TypeIngredientConversion>> {

      // get a list of all possible conversionFactors from the conversion_factor table
      const { list: incompleteConversionFactorList, count } = await postgresQueryBuilder('SELECT food_id, measure_id, value FROM conversion_factor', {
         where: [
            { column: 'food_id', operation: '=', value: food_id.toString() }
         ],
         skip,
         limit,
         includeCount: true
      });

      // attach the measure_description field to each item inside conversionFactorList
      const conversionFactorListList = await Promise.all(incompleteConversionFactorList.map(async conversionFactor => {
         const { rows } = await postgresConnection.query('SELECT description FROM measure WHERE _id = $1 LIMIT 1', [ conversionFactor.measure_id ]);
         if (!rows[0]) { throw new NotFoundError('ingredients.repository.searchConversionOptions ran into an issue finding measure with _id: ' + conversionFactor.measure_id); }
         const { number, string } = breakupMeasureDescription(rows[0].description);
         const value = calculateTrueConversionFactorValue(conversionFactor.value, number);
         return { ...conversionFactor, value, measure_description: string } as TypeIngredientConversion;
      }));

      return { list: conversionFactorListList, count: count!, firstItemIndex: skip};
   }



}