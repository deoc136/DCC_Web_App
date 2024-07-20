'use client';

import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Dialog from '@/components/modal/Dialog';
import { Dispatch, SetStateAction } from 'react';
import Button, { Variant } from '@/components/shared/Button';

interface ICreationConfirmationModal {
   isOpen: boolean;
   setIsOpen: Dispatch<SetStateAction<boolean>>;
   isCreating: boolean;
   create: () => any;
}

export default function CreationConfirmationModal({
   isOpen,
   setIsOpen,
   isCreating,
   create,
}: ICreationConfirmationModal) {
   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="flex min-w-[40vw] flex-col gap-9 rounded-xl p-12">
               <Button
                  className="!w-min self-end bg-transparent !p-0"
                  onPress={() => {
                     setIsOpen(false);
                  }}
               >
                  <CloseRoundedIcon className="!fill-black" />
               </Button>
               <div className="grid justify-items-center gap-9">
                  <InfoRoundedIcon className="!text-8xl text-primary" />
                  <h3 className="mb-3 text-center text-xl">
                     ¿Deseas guardar los cambios?
                  </h3>
               </div>
               <div className="flex gap-5">
                  <Button
                     variant={Variant.secondary}
                     onPress={() => {
                        setIsOpen(false);
                     }}
                  >
                     Atrás
                  </Button>
                  <Button isDisabled={isCreating} onPress={create}>
                     {isCreating ? (
                        <>
                           Cargando...
                           <RefreshRoundedIcon className="animate-spin" />
                        </>
                     ) : (
                        'Guardar'
                     )}
                  </Button>
               </div>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
