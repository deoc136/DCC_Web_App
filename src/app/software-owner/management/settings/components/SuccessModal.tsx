'use client';

import Dialog from '@/components/modal/Dialog';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Button from '@/components/shared/Button';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircle';
import { Dispatch, SetStateAction } from 'react';

interface ISuccessModal {
   isOpen: boolean;
   setIsOpen: Dispatch<SetStateAction<boolean>>;
   title: string;
   subTitle?: string;
}

export default function SuccessModal({
   isOpen,
   title,
   subTitle,
   setIsOpen,
}: ISuccessModal) {
   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="flex  flex-col items-center gap-9 rounded-xl p-8 sm:p-14">
               <CheckCircleRoundedIcon className="!text-8xl text-primary" />
               <div>
                  <h3 className="mb-3 text-center text-xl">{title}</h3>
                  <p className="text-center  !font-normal text-on-background-text body-1">
                     {subTitle}
                  </p>
               </div>
               <Button
                  className="w-min !px-[5.6rem]"
                  onPress={() => {
                     setIsOpen(false);
                  }}
               >
                  Continuar
               </Button>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
