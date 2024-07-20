'use client';

import Dialog from '@/components/modal/Dialog';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Button, { Variant } from '@/components/shared/Button';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import { Dispatch, SetStateAction } from 'react';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

interface IClosingConfirmationModal {
   isOpen: boolean;
   setIsOpen: Dispatch<SetStateAction<boolean>>;
   close: () => any;
   isClosing: boolean;
}

export default function ClosingConfirmationModal({
   isOpen,
   setIsOpen,
   close,
   isClosing,
}: IClosingConfirmationModal) {
   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="flex min-w-[40vw] flex-col items-center gap-9 rounded-xl p-12">
               <WarningRoundedIcon className="!text-8xl !text-warning" />
               <h3 className="mb-3 text-center text-xl">
                  ¿Deseas finalizar la reserva?
               </h3>
               <div className="grid w-full grid-cols-2 gap-5">
                  <Button
                     variant={Variant.secondary}
                     onPress={() => setIsOpen(false)}
                  >
                     Atrás
                  </Button>
                  <Button onPress={close}>
                     {isClosing ? (
                        <>
                           Cargando...
                           <RefreshRoundedIcon className="animate-spin" />
                        </>
                     ) : (
                        'Finalizar'
                     )}
                  </Button>
               </div>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
