'use client';

import Dialog from '../../modal/Dialog';
import ModalTrigger from '../../modal/ModalTrigger';
import Button, { Variant } from '../Button';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';

interface IDeactivationModal {
   isOpen: boolean;
   action: () => any;
   children: React.ReactNode;
   dismiss: () => any;
   isDeactivating: boolean;
}

export default function DeactivationModal({
   isOpen,
   action,
   children,
   dismiss,
   isDeactivating,
}: IDeactivationModal) {
   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="flex flex-col items-center gap-9 rounded-xl p-8 sm:p-14">
               <div className="aspect-square rounded-full bg-error p-3">
                  <ClearRoundedIcon className="!text-6xl text-white" />
               </div>
               {children}
               <div className="flex w-full gap-4">
                  <Button
                     isDisabled={isDeactivating}
                     onPress={dismiss}
                     variant={Variant.secondary}
                  >
                     Cancelar
                  </Button>
                  <Button isDisabled={isDeactivating} onPress={action}>
                     {isDeactivating ? 'Desactivando...' : 'Desactivar'}
                  </Button>
               </div>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
