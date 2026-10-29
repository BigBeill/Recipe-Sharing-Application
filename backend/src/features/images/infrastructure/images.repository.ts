import type { Types } from "mongoose";
import { NotFoundError } from "../../../global/departingData/errorClasses";
import type { TypeImageReferenceDraft } from "../domain/images.types";
import { ImageReferenceModel, type ImageReferenceRecord } from "../../../externalResources/database/mongoose/schemas/image.schema";

interface FetchParams {
   cutoff?: Date;
   statusList?: ('active' | 'deleting' | 'pending')[]
}

export class ImagesRepository { 



   async createImageReference({ key, owner, status = 'pending' }: TypeImageReferenceDraft): Promise<ImageReferenceRecord> {
      return await ImageReferenceModel.create({ key, owner, status });
   }



   async deleteImageReference(_id: Types.ObjectId): Promise<void> {
      await ImageReferenceModel.findByIdAndDelete({ _id });
   }



   async getImageReference(_id: Types.ObjectId): Promise<ImageReferenceRecord> {
      const record = await ImageReferenceModel.findById(_id);
      if (!record) { throw new NotFoundError("Server attempted to locate an image that does not exist"); }
      else { return record; }
   }



   async searchImageReference({ cutoff, statusList = ['active'] }: FetchParams): Promise<ImageReferenceRecord[]>{
      const statusConditions = statusList.map((status) => {
         return { status, ...(cutoff && { createdAt: { $lt: cutoff } }) }
      });

      return ImageReferenceModel.find({ $or: statusConditions })
         .select("_id key status")
         .lean();
   }



   async updateImageReferenceStatus(_id: Types.ObjectId , status: "pending" | "active" | "deleting"): Promise<void> {
      await ImageReferenceModel.updateOne({ _id, status: "pending" }, { status, } ).lean();
   }
}