import { type Types } from "mongoose";
import { NotFoundError } from "../../../global/departingData/errorClasses";
import type { TypeImageReferenceDraft } from "../domain/images.types";
import { ModelImageReference, type RecordImageReference } from "../../../externalResources/database/mongoose/schemas/imageReference.schema";

interface FetchParams {
   cutoff?: Date;
   statusList?: ('active' | 'deleting' | 'pending')[]
}

export class ImagesRepository { 



   async createImageReference({ key, owner, status = 'pending' }: TypeImageReferenceDraft): Promise<RecordImageReference> {
      return await ModelImageReference.create({ key, owner, status });
   }



   async deleteImageReference(_id: Types.ObjectId): Promise<void> {
      await ModelImageReference.findByIdAndDelete({ _id });
   }



   async getImageReference(_id: Types.ObjectId): Promise<RecordImageReference> {
      const record = await ModelImageReference.findById(_id);
      if (!record) { throw new NotFoundError("Server attempted to locate an image that does not exist"); }
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



   async updateImageReferenceStatus(_id: Types.ObjectId , status: "pending" | "active" | "deleting"): Promise<void> {
      await ModelImageReference.updateOne({ _id, status: "pending" }, { status, } ).lean();
   }
}