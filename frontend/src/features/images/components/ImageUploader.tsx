"use client"

import styles from './input.module.scss';

import { useRef, useState, useEffect, Ref, useImperativeHandle } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import { unpackImage } from "../services/image.services";
import { DataHandle } from '@/shared/shared.types';
import { PackagedImageType } from '../domain/image.types';


/*
Image Uploader Component
Props:
   - imageBuffer: The current image file buffer
   - setImageBuffer: Function to update the image buffer
   - oldImageUrl: The URL of the old image (if any)
   - fallbackImageUrl: The URL of the fallback image to use if no image is provided

This component will attempt to display an image source, it chooses what to display with following order of priority:
   1. imageBuffer
   2. oldImageUrl
   3. fallbackImageUrl (should exist inside the project already)

It will give the user the option to upload a new image file, which will be sent to setImageBuffer provided by the parent component.
*/
interface ImageUploaderProps {
   ref: Ref<DataHandle<File | null>>;
   initial?: PackagedImageType;
   category: string;
}

export default function ImageUploader({ ref, initial, category }: ImageUploaderProps) {
   const maxFileSize = 5 * 1024 * 1024; // 5 MB

   const [imageBuffer, setImageBuffer] = useState<File | null>(null);

   useImperativeHandle(ref, () => ({
      getData: () => imageBuffer,
      setData: setImageBuffer,
   }),[]);

   const fileInputRef = useRef<HTMLInputElement | null>(null);
   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
   const [isDragging, setIsDragging] = useState<boolean>(false);

   useEffect(() => {
      if (!(imageBuffer instanceof File)) {
         setPreviewUrl(null);
         return;
      }
      const objectUrl = URL.createObjectURL(imageBuffer);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
   }, [imageBuffer]);

   function updateBuffer(file: File) {
      if (file.size <= maxFileSize) { setImageBuffer(file); }
   }

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
            updateBuffer(uploadedFile);
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
               if (userFile) { (updateBuffer(userFile)); }
            }}
         />

         { previewUrl ? (
            <img className="consumeSpace" alt="preview of uploaded file" src={previewUrl}/>
         ) : ( 
            <img 
               className="consumeSpace" 
               { ...unpackImage(initial) }
            />
         ) }
         <FontAwesomeIcon icon={faCamera} className={isDragging ? 'makeVisible' : ''}/>
      </div>
   )
}