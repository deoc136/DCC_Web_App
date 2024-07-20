'use client';

import Dialog from '@/components/modal/Dialog';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Button, { Variant } from '@/components/shared/Button';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import { Dispatch, SetStateAction } from 'react';

interface IWarningModal {
   isOpen: boolean;
   setIsOpen: Dispatch<SetStateAction<boolean>>;
   setCloseWarning: Dispatch<SetStateAction<boolean>>;
}

export default function WarningModal({
   isOpen,
   setIsOpen,
   setCloseWarning,
}: IWarningModal) {
   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="flex  flex-col items-center gap-9 rounded-xl p-8 sm:p-14">
               <WarningRoundedIcon className="!text-8xl !text-warning" />
               <div>
                  <h3 className="mb-3 text-center text-xl">
                     ¿Estás seguro de cancelar el proceso?
                  </h3>
                  <p className="text-center !font-normal text-on-background-text body-1">
                     Tus cambios no serán guardados
                  </p>
               </div>
               <div className="w-full lg:flex">
                  <Button
                     variant={Variant.secondary}
                     className="mr-2 w-[45%] max-sm:mt-3 sm:mt-3"
                     onPress={() => setCloseWarning(false)}
                  >
                     Atrás
                  </Button>
                  <Button
                     className="ml-auto w-[45%] max-sm:mt-3 sm:mt-3"
                     onPress={() => setIsOpen(false)}
                  >
                     Cancelar
                  </Button>
               </div>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
