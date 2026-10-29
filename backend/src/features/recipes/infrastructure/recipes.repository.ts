import { Types } from "mongoose";
import type { PaginatedListType } from "../../../common/api/apiResponse.types";
import { escapeRegex } from "../../../common/utils/filter";
import { ModelRecipe, type RecordRecipe, type RecordRecipeDraft } from "../../../externalResources/database/mongoose/schemas/recipe.schema";
import { NotFoundError } from "../../../global/departingData/errorClasses";



interface SearchParams {
   // ? main constraints
   title?: string;
   ownerIdList?: Types.ObjectId[];
   ingredientIdList?: number[];
   visibilityList: ('public' | 'private' | 'personal')[];

   // ? supporting data
   authId?: Types.ObjectId; // Required if { visibilityList } contains 'private' or 'personal'
   friendIdList?: Types.ObjectId[]; // ? for filtering when looking for 'private' recipes

   // ? operationalConstraints
   skip?: number;
   limit?: number;
}



export class RecipesRepository {



   async create(recipe: RecordRecipeDraft): Promise<RecordRecipe> {
      return await ModelRecipe.create(recipe);
   }



   async delete(_id: Types.ObjectId): Promise<void> {
      await ModelRecipe.deleteOne({ _id });
   }


   
   async get(_id: Types.ObjectId): Promise<RecordRecipe> {
      const record = await ModelRecipe.findOne({ _id }).lean<RecordRecipe | null>();
      if (!record) { throw new NotFoundError(`Database could no find recipe with id: ${ _id }`); }
      return record;
   }


   
   async search(params: SearchParams): Promise<PaginatedListType<RecordRecipe>> {

      const { title, ownerIdList, ingredientIdList, visibilityList, authId, friendIdList = [], skip, limit } = params;

      // ? quick safety check to make sure this function is being used correctly (not effective authorization)
      if (visibilityList.length === 0) { throw new Error('recipes.repository.search prop { visibilityList } was invalid'); }
      if (visibilityList.includes('private') && !authId) { throw new Error('recipes.repository.search prop { visibilityList } includes the value "private" however a valid { authId } was not provided'); }
      if (visibilityList.includes('personal') && !authId){ throw new Error('recipes.repository.search prop { visibilityList } includes "personal" however a valid { authId } was not provided'); }

      const recipeAccessConditionList = [
         ...(visibilityList.includes('public') ? [{ visibility: 'public' }] : []),
         ...(visibilityList.includes('private') ? [{ $or: [{ visibility: 'public' }, { visibility: 'private' }], ownerId: { $in: [...friendIdList, ...(authId ? [authId] : [])].map(id => new Types.ObjectId(id)) } }] : []),
         ...(visibilityList.includes('personal') ? [{ $or: [{ visibility: 'public'}, { visibility: 'private' }, {visibility: 'personal'}], ownerId: new Types.ObjectId(authId) }] : []),
      ]

      const [result] = await ModelRecipe.aggregate([
         {
            $match: {
               $or: recipeAccessConditionList,
               ...(ingredientIdList?.length ? { 'ingredientList._id': { $all: ingredientIdList } } : {}),
               ...(title && { title: { $regex: escapeRegex(title), $options: 'i' } }),
            } 
         },
         { $sort: { createdAt: -1, _id: -1 } },
         {
            $facet: {
               itemList: [
                  { $skip: skip ?? 0 },
                  ...(limit ? [{ $limit: limit }] : []),
               ],
               countList: [{ $count: 'count' }],
            },
        },
      ]);
      
      return { list: result.itemList, count: result.countList[0]?.count ?? 0, firstItemIndex: skip ?? 0 };
   }



   async update(_id: Types.ObjectId, updateFields: Partial<Omit<RecordRecipeDraft, 'ownerId'>>): Promise<RecordRecipe> {
      const updatedRecipe = await ModelRecipe.findByIdAndUpdate(_id, updateFields, { runValidators: true } );
      if (!updatedRecipe) { throw new NotFoundError(`Recipe with _id: ${ _id } was unable to be updated`); }
      return updatedRecipe;
   }



}