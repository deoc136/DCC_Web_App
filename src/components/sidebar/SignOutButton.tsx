'use client';

import { signOut } from '@/lib/actions/signOut';
import Button, { Variant } from '../shared/Button';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useState } from 'react';
import { GlobalRoute } from '@/lib/routes';
import LogoutRoundedIcon from '@mui/icons-material/Logout';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import ModalTrigger from '../modal/ModalTrigger';
import Dialog from '../modal/Dialog';
import { useAppDispatch } from '@/lib/hooks/redux-hooks';
import { setUser } from '@/lib/features/user/user_slice';
import useDictionary from '@/lib/hooks/useDictionary';

interface ISignOutButton {
   route: GlobalRoute;
   className?: string;
}

export default function SignOutButton({ route, className }: ISignOutButton) {
   const dic = useDictionary();

   const [isModalOpen, setIsModalOpen] = useState(false);

   return (
      <>
         <ConfirmSignOutModal
            isOpen={isModalOpen}
            route={route}
            setIsOpen={setIsModalOpen}
         />
         <Button
            variant={Variant.secondary}
            className={`flex items-center gap-2 rounded-lg !bg-foundation text-start !font-semibold text-on-background-text hover:!bg-primary-100 ${className}`}
            onPress={() => setIsModalOpen(true)}
         >
            <LogoutRoundedIcon className="box-content py-[.4rem]" />{' '}
            {dic.texts.flows.sign_out}
         </Button>
      </>
   );
}

interface IConfirmSignOutModal {
   isOpen: boolean;
   setIsOpen: Dispatch<SetStateAction<boolean>>;
   route: GlobalRoute;
}

function ConfirmSignOutModal({
   isOpen,
   setIsOpen,
   route,
}: IConfirmSignOutModal) {
   const dic = useDictionary();

   const dispatch = useAppDispatch();

   const router = useRouter();
   const [singingOut, setSingingOut] = useState(false);

   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="flex flex-col items-center gap-9 rounded-xl p-8 sm:p-14">
               <div className="aspect-square rounded-full bg-error p-3">
                  <ClearRoundedIcon className="!text-6xl text-white" />
               </div>
               <h3 className="mb-3 min-w-[30vw] text-center text-lg lg:text-xl">
                  {dic.components.sign_out_modal.title}
               </h3>
               <div className="flex h-min w-full gap-4">
                  <Button
                     className="h-min"
                     isDisabled={singingOut}
                     onPress={() => setIsOpen(false)}
                     variant={Variant.secondary}
                  >
                     {dic.texts.flows.cancel}
                  </Button>
                  <Button
                     className="flex items-center justify-center gap-2"
                     isDisabled={singingOut}
                     onPress={async () => {
                        if (singingOut) return;
                        setSingingOut(true);
                        await signOut();
                        dispatch(setUser(null));
                        router.refresh();
                        router.push(route);
                     }}
                  >
                     {singingOut ? (
                        <>
                           {dic.texts.flows.loading}...{' '}
                           <RefreshRoundedIcon className="box-content animate-spin" />
                        </>
                     ) : (
                        <>{dic.texts.flows.sign_out}</>
                     )}
                  </Button>
               </div>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
