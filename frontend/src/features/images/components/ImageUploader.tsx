"use client"

import styles from './input.module.scss';

import { useState, useEffect, Ref, useImperativeHandle, useReducer, useRef } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import { DataHandle } from '@/shared/domain/shared.types';
import { TypeImageReference } from '../domain/image.types';
import { imageService } from '../services/image.service.client';
import useServiceState from '@/shared/lib/hooks/useServiceState';


const RECIPE_IMAGE_FALLBACK = "/recipe-image-fallback.png";
const USER_IMAGE_FALLBACK = "/recipe-image-fallback.png";

interface ImageUploaderProps {
   ref: Ref<DataHandle<TypeImageReference | undefined>>;
   initial?: TypeImageReference;
   category: 'recipes' | 'users';
}

export default function ImageUploader({ ref, initial, category }: ImageUploaderProps) {
   const maxFileSize = 5 * 1024 * 1024; // 5 MB

   const fileInputRef = useRef<HTMLInputElement | null>(null);

   const [imageUrl, setImageUrl] = useState<string | null>(null);
   const [imageBuffer, setImageBuffer] = useReducer((previous: File | null, newFile: File | null) => (newFile && (newFile.size <= maxFileSize) ? newFile : previous), null);
   const [isDragging, setIsDragging] = useState<boolean>(false);

   useImperativeHandle(ref, () => ({
      getData: async () => {
         if (imageBuffer) { return await imageService.upload(category, imageBuffer); }
         else { return undefined; }
      },
      setData: async (imageReference: TypeImageReference | undefined) => {
         if (imageReference) { setImageUrl(await imageService.get(imageReference.key)); }
         else { setImageUrl(null); }
      },
   }), []);

   const initialImageState = useServiceState(async () => { 
      if (initial) { 
         const returnedImageUrl = await imageService.get(initial._id);
         setImageUrl(returnedImageUrl);
         return returnedImageUrl; 
      }
      else { 
         return null; 
      }
   }, [initial]);

   // ? update ImageUrl to keep up with imageBuffer()
   useEffect(() => {
      if (!imageBuffer) { 
         if (initialImageState.status === 'ready') { setImageUrl(initialImageState.data); }
         else { setImageUrl(null); }
      }
      else {
         const uploadUrl = URL.createObjectURL(imageBuffer);
         setImageUrl(uploadUrl);
         return () => URL.revokeObjectURL(uploadUrl);
      }
   }, [imageBuffer]);

   function uploadFile() {
      fileInputRef.current?.click();
   }

   function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(true);
   }

   function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
   }

   function handleDrop(event: React.DragEvent<HTMLDivElement>) {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);

      const files = event.dataTransfer.files;
      if (files && files.length > 0) {
         const uploadedFile = files[0];
         const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
         if (validTypes.includes(uploadedFile.type) && uploadedFile.size <= maxFileSize) {
            setImageBuffer(uploadedFile);
            event.dataTransfer.clearData();
         }
      }
   }

   return (
      <div 
         className={styles.inputWrapper}
         onClick={uploadFile}
         onDragOver={handleDragOver}
         onDragLeave={handleDragLeave}
         onDrop={handleDrop}
      >
         {/* input will be hidden by css, but still included in DOM for screen readers */}
         <input 
            type="file"
            ref={fileInputRef}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            aria-label="Choose an image for uploading"
            onChange={(event) => { 
               const userFile = event.target.files?.[0];
               if (userFile) { (setImageBuffer(userFile)); }
            }}
         />

         { imageUrl ? (
            <img className="consumeSpace" alt="preview of uploaded file" src={imageUrl}/>
         ) : ( category === 'recipes'
            ? <img className="consumeSpace" alt="preview of uploaded file" src={ RECIPE_IMAGE_FALLBACK }/>
            : <img className="consumeSpace" alt="preview of uploaded file" src={ USER_IMAGE_FALLBACK }/>
         ) }
         <FontAwesomeIcon icon={faCamera} className={isDragging ? 'makeVisible' : ''}/>
      </div>
   )
}