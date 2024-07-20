'use client';

import React, {
   ChangeEvent,
   DragEvent,
   RefObject,
   useEffect,
   useMemo,
   useState,
} from 'react';
import Button, { Variant } from '../shared/Button';
import Image from 'next/image';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import BackupRoundedIcon from '@mui/icons-material/Backup';

interface IInputFile {
   inputFileRef: RefObject<HTMLInputElement>;
   dropHandler: (e: DragEvent<HTMLDivElement>) => Promise<any>;
   imageInputHandler: (e: ChangeEvent<HTMLInputElement>) => any;
   file: string | File | undefined;
   accept: string;
   children: React.ReactNode;
   clearFile: () => any;
}

export default function InputFile({
   dropHandler,
   imageInputHandler,
   inputFileRef,
   file,
   accept,
   children,
   clearFile,
}: IInputFile) {
   const imageUrl = useMemo(() => {
      if (file && typeof file !== 'string') {
         return URL.createObjectURL(file);
      } else {
         return '';
      }
   }, [file]);

   const [error, setError] = useState<any>(null);

   useEffect(() => {
      setError(null);
   }, [imageUrl]);

   return (
      <div
         onClick={() => inputFileRef.current?.click()}
         onDrop={dropHandler}
         onDragOver={e => {
            e.preventDefault();

            e.currentTarget.classList.add('border-primary', '!border-solid');
         }}
         onDragLeave={e => {
            e.preventDefault();

            e.currentTarget.classList.remove('border-primary', '!border-solid');
         }}
         className="col-span-full flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-gray-300 py-14 hover:border-primary"
      >
         {file && file instanceof File ? (
            <div className="relative aspect-video w-44 overflow-hidden">
               <Image
                  onErrorCapture={setError}
                  className="object-contain"
                  alt="clinic image"
                  fill
                  src={error ? '/file_placeholder.png' : imageUrl}
               />
            </div>
         ) : (
            <>
               <BackupRoundedIcon className="!text-5xl text-on-background-disabled" />
               <div>{children}</div>
            </>
         )}

         <input
            onChange={imageInputHandler}
            ref={inputFileRef}
            className="hidden"
            type="file"
            accept={accept}
         />
         <div className="mt-2 flex max-w-[50%] gap-4 ">
            <Button
               onPress={() => inputFileRef.current?.click()}
               variant={Variant.outlined}
               className="!w-max truncate"
            >
               {file === undefined
                  ? 'Seleccionar archivo'
                  : typeof file === 'string'
                  ? file
                  : file.name}
            </Button>
            {file && file instanceof File && (
               <Button
                  onPress={clearFile}
                  className="!w-max"
                  variant={Variant.secondary}
               >
                  <CloseRoundedIcon />
               </Button>
            )}
         </div>
      </div>
   );
}
