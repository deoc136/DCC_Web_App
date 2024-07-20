'use client';

import Dialog from '@/components/modal/Dialog';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Button, { Variant } from '@/components/shared/Button';
import { ClinicRoute } from '@/lib/routes';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction } from 'react';

interface IWarningModal {
   isOpen: boolean;
   setIsOpen: Dispatch<SetStateAction<boolean>>;
   route: ClinicRoute;
}

export default function WarningModal({
   isOpen,
   setIsOpen,
   route,
}: IWarningModal) {
   const router = useRouter();

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
                     Una vez eliminado no podrás recuperar la información que
                     hayas <br /> ingresado sobre el paquete
                  </p>
               </div>
               <div className="grid w-full grid-cols-2 gap-3">
                  <Button
                     variant={Variant.secondary}
                     onPress={() => setIsOpen(false)}
                  >
                     Atrás
                  </Button>
                  <Button href={route}>Cancelar</Button>
               </div>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
