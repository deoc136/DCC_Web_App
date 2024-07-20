'use client';

import Dialog from '../../modal/Dialog';
import ModalTrigger from '../../modal/ModalTrigger';
import Button, { Variant } from '../Button';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';

interface IActivationModal {
   isOpen: boolean;
   action: () => any;
   children: React.ReactNode;
   dismiss: () => any;
   isActivating: boolean;
}

export default function ActivationModal({
   isOpen,
   action,
   children,
   dismiss,
   isActivating,
}: IActivationModal) {
   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="flex flex-col items-center gap-9 rounded-xl p-8 sm:p-14">
               <InfoRoundedIcon className="!fill-primary !text-8xl" />
               {children}
               <div className="flex w-full gap-4">
                  <Button
                     isDisabled={isActivating}
                     onPress={dismiss}
                     variant={Variant.secondary}
                  >
                     Cancelar
                  </Button>
                  <Button isDisabled={isActivating} onPress={action}>
                     {isActivating ? 'Activando...' : 'Activar'}
                  </Button>
               </div>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
