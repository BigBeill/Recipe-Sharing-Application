import { UserType } from "../domain/user.types";

export function createUserFormData(user: UserType, imageBuffer?: File): FormData {
   const formData = new FormData();

   formData.append("_id", user._id);
   if(user.name) { formData.append("name", user.name); }
   if(user.email) { formData.append("email", user.email); }
   if(user.bio) { formData.append("bio", user.bio); }
	if (imageBuffer instanceof File) { formData.append("image", imageBuffer); }

   return formData;
}