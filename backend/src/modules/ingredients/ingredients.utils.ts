import type { QueryResult, QueryResultRow } from "pg";
import postgresConnection from "../../config/postgres.database";
import type { IngredientType } from "./ingredients.types";

interface BuildPostgresQueryParams {
   where?: {
      column: string,
      operation: string,
      value: unknown,
   }[],
   skip?: number,
   limit?: number,
   order?: { column: string, direction: 'DESC' | 'ASC' },
   includeCount?: boolean
}

export async function postgresQueryBuilder<T extends QueryResultRow>(baseQuery: string, functionParams: BuildPostgresQueryParams = {}): Promise<{ content: T[], count?: number }>{
   const { where = [], skip, limit, order, includeCount } = functionParams;

   const params: unknown[] = [];
   const conditions: string[] = [];

   for (const { column, operation, value } of where) {
      params.push(value);
      if (operation === 'IN') {
         conditions.push(`${column} = ANY($${params.length})`);
      } else if (operation === 'NOT IN') {
         conditions.push(`${column} <> ALL($${params.length})`);
      } else {
         conditions.push(`${column} ${operation} $${params.length}`);
      }
   }

   const whereClause = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
   let query = `WITH filter AS (${baseQuery} ${whereClause}), contentConstraints AS (SELECT * FROM filter`;

   if (order) {
      // TODO: ADD A CHECK FOR {order.column} TO PREVENT SQL INJECTION
      query += ` ORDER BY ${order.column} ${order.direction === 'DESC' ? 'DESC' : 'ASC'}`;
   }

   if (limit != null) { 
      params.push(String(limit));
      query += ` LIMIT $${params.length}`;
   }
   if (skip != null) { 
      params.push(String(skip));
      query += ` OFFSET $${params.length}`;
   }

   query += `) SELECT json_build_object( 'content', COALESCE((SELECT json_agg(contentConstraints) FROM contentConstraints), '[]'::json)`;
   
   if(includeCount) {
      query += `, 'count', (SELECT COUNT(*) FROM filter)`;
   }

   query += ') AS result;';

   const { rows } = await postgresConnection.query<{ result: { content: T[], count: number }}>(query, params);

   return rows[0]!.result;
}

export function breakupMeasureDescription(measureDescription: string ): { number: number, string: string} {
   let numberAsString = "";
   let denominator = "";
   let slashFound = false;
   let unitStart = 0;

   // go through each number in the string until a character is found
   for (let i = 0; i < measureDescription.length; i++) {
      if (/[\d.]/.test(measureDescription[i]!)) {
         if(!slashFound) numberAsString += measureDescription[i];
         else denominator += measureDescription[i];
      } 
      else if (measureDescription[i] == "/") slashFound = true;
      else{
         if (measureDescription[i] == " ") unitStart = i + 1;
         else unitStart = i;
         break;
      }
   }

   const number = Number(numberAsString) / (Number(denominator) || 1);

   const string =  measureDescription.slice(unitStart);

   return { number, string }
}

type StoredIngredient = Pick<IngredientType, '_id' | 'label'> & {
   portion: Pick<NonNullable<IngredientType['portion']>, '_id' | 'amount'>;
};

export function toStoredIngredient(ingredient: IngredientType): StoredIngredient {
   if (!ingredient.portion) { throw new Error("ingredient is missing portions field and cannot be converted into storedIngredientType."); }
   return {
      _id: ingredient._id,
      label: ingredient.label,
      portion: {
         _id: ingredient.portion._id,
         amount: ingredient.portion.amount,
      }
   };
}