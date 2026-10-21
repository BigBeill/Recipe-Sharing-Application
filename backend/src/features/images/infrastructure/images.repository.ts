import type { Types } from "mongoose";
import { ImageModel, type ImageRecord } from "../../../externalResources/database/mongoose/schemas/image.schema";
import { NotFoundError } from "../../../global/departingData/error.types";
import type { TypeImageReferenceDraft } from "../domain/images.types";

interface FetchParams {
   cutoff?: Date;
   statusList?: ('active' | 'deleting' | 'pending')[]
}

export class ImagesRepository { 



   async createImageReference({ key, owner, status = 'pending' }: TypeImageReferenceDraft): Promise<void> {
      await ImageModel.create({ key, owner, status });
   }



   async deleteImageReference(_id: Types.ObjectId): Promise<void> {
      await ImageModel.findByIdAndDelete({ _id });
   }



   async getImageReference(_id: Types.ObjectId): Promise<ImageRecord> {
      const record = await ImageModel.findById(_id);
      if (!record) { throw new NotFoundError("Server attempted to locate an image that does not exist"); }
      else { return record; }
   }



   async searchImageReference({ cutoff, statusList = ['active'] }: FetchParams): Promise<ImageRecord[]>{
      const statusConditions = statusList.map((status) => {
         return { status, ...(cutoff && { createdAt: { $lt: cutoff } }) }
      });

      return ImageModel.find({ $or: statusConditions })
         .select("_id key status")
         .lean();
   }



   async updateImageReferenceStatus(_id: Types.ObjectId , status: "pending" | "active" | "deleting"): Promise<void> {
      await ImageModel.updateOne({ _id, status: "pending" }, { status, } ).lean();
   }
}