import { Types } from "mongoose";
import { escapeRegex } from "../../../common/utils/filter";
import { ModelRecipe, type RecordRecipe, type RecordRecipeDraft } from "../../../externalResources/database/mongoose/schemas/recipe.schema";
import { NotFoundError } from "../../../global/departingData/errorClasses";
import type { TypePaginatedList } from "../../../common/domain/types.common";
import { Protected, ProtectedRepository } from "../../authorization/decorators/ProtectedRepository";



interface SearchParams {
   // ? main constraints
   title?: string;
   ownerIdList?: Types.ObjectId[];
   ingredientIdList?: number[];
   visibilityList: ('public' | 'private' | 'personal')[];

   // ? operationalConstraints
   skip?: number;
   limit?: number;
}



export class RecipesRepository extends ProtectedRepository {
   readonly resourceName = "recipes";



   @Protected
   async create(recordRecipeDraft: RecordRecipeDraft): Promise<RecordRecipe> {
      return await ModelRecipe.create({ ...recordRecipeDraft, ownerId: this.clientId });
   }



   @Protected
   async delete(_id: Types.ObjectId): Promise<RecordRecipe> {
      const recipeRecord = await ModelRecipe.findOneAndDelete({ _id, ownerId: this.clientId });
      if (!recipeRecord) { throw new NotFoundError(); }
      return recipeRecord;
   }



   async get(_id: Types.ObjectId): Promise<RecordRecipe> {
      const recipeRecord = await ModelRecipe.findOne({ $match: {
         _id,
         $or: [
            { visibility: 'public' },
            { visibility: 'private', ownerId: this.authorization.id },
            { visibility: 'private', ownerId: { $in: (await this.authorization.getFriendIdList()) } },
            { visibility: 'personal', ownerId : this.authorization.id },
         ]
      } }).lean<RecordRecipe | null>();
      if (!recipeRecord) { throw new NotFoundError('recipe'); }
      return recipeRecord;
   }



   async search(params: SearchParams): Promise<TypePaginatedList<RecordRecipe>> {

      const { title, ownerIdList, ingredientIdList, visibilityList, skip, limit } = params;

      // ? quick safety check to make sure this function is being used correctly (not effective authorization)
      if (visibilityList.length === 0) { throw new Error('recipes.repository.search prop { visibilityList } was invalid'); }
      if (visibilityList.includes('private') && !this.clientId) { throw new Error('recipes.repository.search prop { visibilityList } includes the value "private" however a valid { authId } was not provided'); }
      if (visibilityList.includes('personal') && !this.clientId){ throw new Error('recipes.repository.search prop { visibilityList } includes "personal" however a valid { authId } was not provided'); }

      const recipeAccessConditionList = [
         ...(visibilityList.includes('public') ? [{ visibility: 'public' }] : []),
         ...(visibilityList.includes('private') ? [{ $or: [{ visibility: 'public' }, { visibility: 'private' }], ownerId: { $in: [...(await this.authorization.getFriendIdList()), ...(this.authorization.id ? [this.authorization.id] : [])].map(id => new Types.ObjectId(id)) } }] : []),
         ...(visibilityList.includes('personal') ? [{ $or: [{ visibility: 'public'}, { visibility: 'private' }, {visibility: 'personal'}], ownerId: new Types.ObjectId(this.authorization.id) }] : []),
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



   @Protected
   async update(_id: Types.ObjectId, updateFields: Partial<RecordRecipeDraft>): Promise<RecordRecipe> {
      const recipeRecord = await ModelRecipe.findOneAndUpdate({ _id, ownerId: this.clientId }, updateFields, { runValidators: true } );
      if (!recipeRecord) { throw new NotFoundError(); }
      return recipeRecord;
   }



}