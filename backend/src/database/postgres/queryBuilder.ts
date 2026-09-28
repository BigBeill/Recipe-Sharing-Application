import type { QueryResultRow } from "pg";
import postgresConnection from "../config/postgres.database";

/*
   postgresQueryBuilder(baseQuery, conditionProps)

   Takes a base query --> SELECT ___ FROM ___
   Attaches provided conditions --> check interface ConditionProps
   Executes query
   Returns results --> { list: T[], count: number }
*/

interface ConditionProps {
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

export async function postgresQueryBuilder<T extends QueryResultRow>(baseQuery: string, conditionProps: ConditionProps = {}): Promise<{ list: T[], count?: number }>{
   const { where = [], skip, limit, order, includeCount } = conditionProps;

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

   query += `) SELECT json_build_object( 'list', COALESCE((SELECT json_agg(contentConstraints) FROM contentConstraints), '[]'::json)`;
   
   if(includeCount) {
      query += `, 'count', (SELECT COUNT(*) FROM filter)`;
   }

   query += ') AS result;';

   const { rows } = await postgresConnection.query<{ result: { list: T[], count: number }}>(query, params);

   return rows[0]!.result;
}