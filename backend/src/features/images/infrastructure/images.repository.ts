import { type Types } from "mongoose";
import { NotFoundError } from "../../../global/departingData/errorClasses";
import type { TypeImageReferenceDraft } from "../domain/images.types";
import { ModelImageReference, type RecordImageReference } from "../../../externalResources/database/mongoose/schemas/imageReference.schema";
import { Protected, ProtectedRepository } from "../../authorization/decorators/ProtectedRepository";

interface FetchParams {
   cutoff?: Date;
   statusList?: ('active' | 'deleting' | 'pending')[]
}

export class ImagesRepository extends ProtectedRepository {
   readonly resourceName = 'images';



   @Protected
   async createImageReference({ key, status = 'pending' }: Omit<TypeImageReferenceDraft, 'owner'>): Promise<RecordImageReference> {
      return await ModelImageReference.create({ key, owner: this.clientId, status });
   }



   @Protected
   async deleteImageReference(_id: Types.ObjectId): Promise<void> {
      const deletedRecord = await ModelImageReference.findByIdAndDelete({ _id, owner: this.clientId });
      if (!deletedRecord) { throw new NotFoundError(); }
   }



   async getImageReference(_id: Types.ObjectId): Promise<RecordImageReference> {
      const record = await ModelImageReference.findById(_id);
      if (!record) { throw new NotFoundError('image'); }
      else { return record; }
   }



   async searchImageReference({ cutoff, statusList = ['active'] }: FetchParams): Promise<RecordImageReference[]>{
      const statusConditions = statusList.map((status) => {
         return { status, ...(cutoff && { createdAt: { $lt: cutoff } }) }
      });

      return ModelImageReference.find({ $or: statusConditions })
         .select("_id key status")
         .lean();
   }



   @Protected
   async updateImageReferenceStatus(_id: Types.ObjectId , status: "pending" | "active" | "deleting"): Promise<RecordImageReference> {
      const updatedRecord = await ModelImageReference.findOneAndUpdate({ _id, owner: this.clientId }, { status }, { runValidators: true } ).lean();
      if (!updatedRecord) { throw new NotFoundError(); }
      return updatedRecord;
   }
}