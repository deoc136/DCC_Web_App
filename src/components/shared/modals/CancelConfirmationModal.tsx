'use client';

import Dialog from '@/components/modal/Dialog';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Button, { Variant } from '@/components/shared/Button';
import useDictionary from '@/lib/hooks/useDictionary';
import { GlobalRoute } from '@/lib/routes';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import { Dispatch, SetStateAction } from 'react';

interface ICancelConfirmationModal {
   isOpen: boolean;
   setIsOpen: Dispatch<SetStateAction<boolean>>;
   route: GlobalRoute;
}

export default function CancelConfirmationModal({
   isOpen,
   setIsOpen,
   route,
}: ICancelConfirmationModal) {
   const dic = useDictionary();

   return (
      <ModalTrigger
         className="m-2 animate-appear text-sm sm:m-8 lg:text-base"
         isOpen={isOpen}
      >
         {() => (
            <Dialog className="flex min-w-[40vw] flex-col items-center gap-9 rounded-xl p-8 md:p-12">
               <WarningRoundedIcon className="!text-7xl !text-warning lg:!text-8xl" />
               <div>
                  <h3 className="mb-3 text-center text-base lg:text-xl">
                     {dic.components.cancelation_confirm_modal.title}
                  </h3>
                  <p className="text-center !font-normal text-on-background-text">
                     {
                        dic.components.cancelation_confirm_modal
                           .description
                     }
                  </p>
               </div>
               <div className="grid w-full grid-cols-2 gap-2 md:gap-5">
                  <Button
                     variant={Variant.secondary}
                     onPress={() => setIsOpen(false)}
                  >
                     {dic.texts.flows.back}
                  </Button>
                  <Button href={route}>{dic.texts.flows.cancel}</Button>
               </div>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
