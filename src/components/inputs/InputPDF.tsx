'use client';

import React, {
   ChangeEvent,
   DragEvent,
   RefObject,
   useEffect,
   useMemo,
   useState,
} from 'react';
import BackupRoundedIcon from '@mui/icons-material/Backup';
import Card from '../shared/cards/Card';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import Button, { Variant } from '../shared/Button';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded';
import useDictionary from '@/lib/hooks/useDictionary';

interface IInputPDF {
   inputFileRef: RefObject<HTMLInputElement>;
   dropHandler: (e: DragEvent<HTMLDivElement>) => Promise<any>;
   imageInputHandler: (e: ChangeEvent<HTMLInputElement>) => any;
   file: string | File | undefined;
   children: React.ReactNode;
   clearFile: () => any;
}

export default function InputPDF({
   dropHandler,
   imageInputHandler,
   inputFileRef,
   file,
   children,
   clearFile,
}: IInputPDF) {
   const dic = useDictionary();

   return (
      <>
         <input
            onChange={imageInputHandler}
            ref={inputFileRef}
            className="hidden"
            type="file"
            accept="application/pdf"
         />
         {file ? (
            <div className="col-span-full flex min-h-[50vh] w-full flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-gray-300 bg-foundation py-14">
               <Card className="mx-4 grid gap-6">
                  <Button
                     onPress={clearFile}
                     className="w-max justify-self-end bg-transparent !p-0"
                  >
                     <CloseRoundedIcon className="!fill-black" />
                  </Button>
                  {typeof file === 'string' ? (
                     <>
                        <p className="text-center text-xs text-error lg:text-sm">
                           {file}
                        </p>
                        <Button
                           className="w-full truncate"
                           variant={Variant.outlined}
                        >
                           <FileUploadRoundedIcon />{' '}
                           {dic.texts.flows.reupload_file}
                        </Button>
                     </>
                  ) : (
                     <>
                        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 font-semibold">
                           <InsertDriveFileRoundedIcon className="!fill-on-background-disabled !text-4xl" />
                           <p className="w-full truncate">{file.name}</p>
                           <p className="w-full truncate text-primary">
                              {(file.size / 1000000).toFixed(1)}MB
                           </p>
                        </div>
                        <div className="grid gap-x-5 gap-y-2 md:grid-cols-2">
                           <Button
                              onPress={() => inputFileRef.current?.click()}
                              variant={Variant.outlined}
                           >
                              <FileUploadRoundedIcon />{' '}
                              {dic.components.upload_file_input.replace_file}
                           </Button>
                           <Button
                              onPress={() =>
                                 window.open(URL.createObjectURL(file))
                              }
                              variant={Variant.secondary}
                           >
                              {dic.components.upload_file_input.open_preview}
                           </Button>
                        </div>
                     </>
                  )}
               </Card>
            </div>
         ) : (
            <div
               onClick={() => inputFileRef.current?.click()}
               onDrop={dropHandler}
               onDragOver={e => {
                  e.preventDefault();

                  e.currentTarget.classList.add(
                     'border-primary',
                     '!border-solid',
                  );
               }}
               onDragLeave={e => {
                  e.preventDefault();

                  e.currentTarget.classList.remove(
                     'border-primary',
                     '!border-solid',
                  );
               }}
               className="col-span-full flex min-h-[50vh] cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-gray-300 bg-foundation py-14 hover:border-primary"
            >
               <BackupRoundedIcon className="!fill-primary !text-7xl" />
               <div>{children}</div>
            </div>
         )}
      </>
   );
}
