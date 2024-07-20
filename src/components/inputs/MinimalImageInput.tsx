'use client';

import React, { ChangeEvent, RefObject } from 'react';
import Button, { Variant } from '../shared/Button';
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded';
import useDictionary from '@/lib/hooks/useDictionary';

interface IMinimalImageInput {
   inputFileRef: RefObject<HTMLInputElement>;
   imageInputHandler: (e: ChangeEvent<HTMLInputElement>) => any;
   file: string | File | undefined;
   className?: string;
}

export default function MinimalImageInput({
   imageInputHandler,
   inputFileRef,
   file,
   className,
}: IMinimalImageInput) {
   const dic = useDictionary();

   return (
      <>
         <Button
            onPress={() => inputFileRef.current?.click()}
            variant={Variant.outlined}
            className={`flex w-full justify-self-center truncate ${className}`}
         >
            <span className="w-full items-center justify-center gap-1 truncate">
               {file === undefined ? (
                  <>
                     <FileUploadRoundedIcon />
                     {dic.texts.flows.upload_image}
                  </>
               ) : typeof file === 'string' ? (
                  file
               ) : (
                  file.name
               )}
            </span>
         </Button>
         <input
            onChange={imageInputHandler}
            ref={inputFileRef}
            className="hidden"
            type="file"
            accept="image/jpeg, image/png"
         />
      </>
   );
}
