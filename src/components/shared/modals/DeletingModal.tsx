'use client';

import Dialog from '../../modal/Dialog';
import ModalTrigger from '../../modal/ModalTrigger';
import Button, { Variant } from '../Button';
import ClearRounded from '@mui/icons-material/ClearRounded';

interface IDeletingModal {
   isOpen: boolean;
   action: () => any;
   children: React.ReactNode;
   dismiss: () => any;
   isDeleting: boolean;
}

export default function DeletingModal({
   isOpen,
   action,
   children,
   dismiss,
   isDeleting,
}: IDeletingModal) {
   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="flex flex-col items-center gap-9 rounded-xl p-8 sm:p-14">
               <div className="aspect-square rounded-full bg-error p-3">
                  <ClearRounded className="!text-6xl text-white" />
               </div>
               {children}
               <div className="flex w-full gap-4">
                  <Button
                     isDisabled={isDeleting}
                     onPress={dismiss}
                     variant={Variant.secondary}
                  >
                     Cancelar
                  </Button>
                  <Button isDisabled={isDeleting} onPress={action}>
                     {isDeleting ? 'Eliminando...' : 'Eliminar'}
                  </Button>
               </div>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
