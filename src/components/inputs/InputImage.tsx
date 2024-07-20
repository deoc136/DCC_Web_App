'use client';

import React, { ChangeEvent, DragEvent, RefObject, useMemo } from 'react';
import Button, { Variant } from '../shared/Button';
import Image from 'next/image';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import BackupRoundedIcon from '@mui/icons-material/Backup';
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';

interface IInputImage {
   inputFileRef: RefObject<HTMLInputElement>;
   imageInputHandler: (e: ChangeEvent<HTMLInputElement>) => any;
   file: string | File | undefined;
   children: React.ReactNode;
   clearFile: () => any;
   defaultImageUrl: string;
}

export default function InputImage({
   imageInputHandler,
   inputFileRef,
   file,
   children,
   clearFile,
   defaultImageUrl,
}: IInputImage) {
   const imageUrl = useMemo(() => {
      if (file && typeof file !== 'string') {
         return URL.createObjectURL(file);
      } else {
         return '';
      }
   }, [file]);

   return (
      <div
         onClick={() => inputFileRef.current?.click()}
         className="relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-gray-300 py-14 hover:border-primary"
      >
         <div className="absolute z-20 flex flex-col items-center">
            <UploadRoundedIcon className="!text-5xl text-on-background-text" />
            <div>{children}</div>
            <div className="mt-2 grid w-full grid-cols-[1fr_auto] justify-center gap-4 px-4 ">
               <Button
                  onPress={() => inputFileRef.current?.click()}
                  variant={Variant.outlined}
                  className="justify-self-center truncate"
               >
                  {file === undefined
                     ? 'Seleccionar archivo'
                     : typeof file === 'string'
                     ? file
                     : file.name}
               </Button>
               {file instanceof File && (
                  <Button
                     onPress={clearFile}
                     className="!w-max"
                     variant={Variant.outlined}
                  >
                     <CloseRoundedIcon />
                  </Button>
               )}
            </div>
         </div>
         <div className="absolute inset-0 z-10 bg-white opacity-80" />
         {file instanceof File ? (
            <Image
               className="z-0 object-contain"
               alt="clinic image"
               fill
               src={imageUrl}
            />
         ) : (
            <Image
               className="z-0 object-contain"
               alt="clinic image"
               fill
               src={defaultImageUrl}
            />
         )}
         <input
            onChange={imageInputHandler}
            ref={inputFileRef}
            className="hidden"
            type="file"
            accept="image/jpeg, image/png"
         />
      </div>
   );
}
