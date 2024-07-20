'use client';

import Dialog from '@/components/modal/Dialog';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Button, { Variant } from '@/components/shared/Button';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';

interface IRemoveServiceModal {
   isOpen: boolean;
   action: () => any;
   dismiss: () => any;
}

export default function RemoveServiceModal({
   isOpen,
   action,
   dismiss,
}: IRemoveServiceModal) {
   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="flex flex-col items-center gap-9 rounded-xl p-8 sm:p-14">
               <WarningRoundedIcon className="!text-8xl !text-warning" />
               <div>
                  <h3 className="mb-3 text-center text-xl">
                     ¿Deseas remover este servicio del terapeuta?
                  </h3>
               </div>
               <div className="flex w-full gap-4">
                  <Button onPress={dismiss} variant={Variant.secondary}>
                     Cancelar
                  </Button>
                  <Button onPress={action}>Remover</Button>
               </div>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
