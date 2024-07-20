'use client';

import Dialog from '@/components/modal/Dialog';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Button from '@/components/shared/Button';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircle';

interface ISuccessModal {
   isOpen: boolean;
   action?: () => any;
}

export default function SuccessModal({ isOpen, action }: ISuccessModal) {
   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="flex flex-col items-center gap-9 rounded-xl p-8 sm:p-14">
               <CheckCircleRoundedIcon className="!text-8xl text-primary" />
               <div>
                  <h3 className="mb-3 text-center text-lg sm:text-xl">
                     ¡Tu contraseña ha sido cambiada con éxito!
                  </h3>
                  <p className="text-center !font-normal text-on-background-text">
                     Ahora puedes iniciar sesión con tu nueva contraseña.
                  </p>
               </div>
               <Button className="w-min !px-[5.6rem]" onPress={action ?? close}>
                  Continuar
               </Button>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
