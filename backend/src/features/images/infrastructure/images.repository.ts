import { type Types } from "mongoose";
import type { TypeImageReferenceDraft } from "../domain/images.types";
import { ModelImageReference, type RecordImageReference } from "../../../externalResources/database/mongoose/schemas/imageReference.schema";
import { Protected } from "../../authorization/decorators/Protected";
import { AccessControlled } from "../../authorization/decorators/AccessControlled.function";
import { AppErrorNotFound } from "../../../global/departingData/errorClasses";

interface FetchParams {
   cutoff?: Date;
   statusList?: ('active' | 'deleting' | 'pending')[]
}

export class ImagesRepository extends AccessControlled {



   @Protected
   async createImageReference({ key, status = 'pending' }: Omit<TypeImageReferenceDraft, 'owner'>): Promise<RecordImageReference> {
      return await ModelImageReference.create({ key, owner: this.authorization.requireClientId(), status });
   }



   @Protected
   async deleteImageReference(_id: Types.ObjectId): Promise<void> {
      const deletedRecord = await ModelImageReference.findByIdAndDelete({ _id, owner: this.authorization.requireClientId() });
      if (!deletedRecord) { throw new AppErrorNotFound('image'); }
   }



   async getImageReference(_id: Types.ObjectId): Promise<RecordImageReference> {
      const record = await ModelImageReference.findById(_id);
      if (!record) { throw new AppErrorNotFound('image'); }
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
      const updatedRecord = await ModelImageReference.findOneAndUpdate({ _id, owner: this.authorization.requireClientId() }, { status }, { runValidators: true } ).lean();
      if (!updatedRecord) { throw new AppErrorNotFound('image'); }
      return updatedRecord;
   }
}