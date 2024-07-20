'use client';

import Dialog from '@/components/modal/Dialog';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Button, { Variant } from '@/components/shared/Button';
import {
   ChangeEvent,
   Dispatch,
   DragEvent,
   RefObject,
   SetStateAction,
} from 'react';
import InputFile from '@/components/inputs/InputFile';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

interface IChangeImageModal {
   isOpen: boolean;
   setIsOpen: Dispatch<SetStateAction<boolean>>;
   inputFileRef: RefObject<HTMLInputElement>;
   dropHandler: (e: DragEvent<HTMLDivElement>) => Promise<any>;
   imageInputHandler: (e: ChangeEvent<HTMLInputElement>) => any;
   file: File | string | undefined;
   clearFile: () => any;
}

export default function ChangeImageModal({
   isOpen,
   setIsOpen,
   inputFileRef,
   dropHandler,
   imageInputHandler,
   file,
   clearFile,
}: IChangeImageModal) {
   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="flex flex-col gap-6 rounded-xl p-7">
               <div className="flex w-[60vw] max-w-screen-lg items-center justify-between">
                  <h2 className="text-2xl font-semibold">Cambiar Logo</h2>
                  <Button
                     className="!w-max bg-transparent !p-0"
                     onPress={() => setIsOpen(false)}
                  >
                     <CloseRoundedIcon className="!fill-black" />
                  </Button>
               </div>
               <InputFile
                  accept="image/jpeg, image/png"
                  dropHandler={dropHandler}
                  imageInputHandler={imageInputHandler}
                  inputFileRef={inputFileRef}
                  file={file}
                  clearFile={clearFile}
               >
                  <h4 className="mb-3 text-center font-semibold text-on-background-text">
                     Seleccione o arrastre hasta aquí
                     <br />
                     el logotipo de la empresa
                  </h4>
                  <p className="font-normal text-on-background-text">
                     JPG o PNG, tamaño de archivo no superior a 10 MB
                  </p>
               </InputFile>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
