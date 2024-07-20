'use client';

import Dialog from '@/components/modal/Dialog';
import ModalTrigger, { IModalTrigger } from '@/components/modal/ModalTrigger';
import Button, { Variant } from '@/components/shared/Button';
import { ListBox } from '@/components/shared/ListBox';
import Sidebar from '@/components/sidebar/Sidebar';
import SignOutButton from '@/components/sidebar/SignOutButton';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import { clinicRoutes } from '@/lib/routes';
import Image from 'next/image';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { Item, Section } from 'react-stately';
import { useMediaQuery } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import { BookRounded, HistoryRounded, PeopleAlt } from '@mui/icons-material';

interface ITherapistMobileSidebar {
   isOpen: boolean;
   setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export default function TherapistMobileSidebar({
   isOpen,
   setIsOpen,
}: ITherapistMobileSidebar) {
   const clinic = useAppSelector(store => store.clinic);

   const pathname = usePathname();

   const isLg = useMediaQuery('(min-width:1024px)');

   useEffect(() => {
      isLg && setIsOpen(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [isLg]);

   useEffect(() => {
      setIsOpen(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [pathname]);

   return (
      <ModalTrigger
         className="bot-0 absolute left-0 top-0 translate-x-0 animate-slide xl:hidden"
         isOpen={isOpen}
      >
         {() => (
            <Dialog className="grid h-screen max-h-none w-[90vw] grid-rows-[auto_1fr] rounded-r-2xl !bg-foundation pb-5 pt-10 md:w-[40vw]">
               <div className="grid px-5">
                  <Button
                     className="ml-auto !w-max bg-transparent !p-0"
                     onPress={() => {
                        setIsOpen(false);
                     }}
                  >
                     <CloseRoundedIcon className="!fill-black" />
                  </Button>
                  <div className="relative aspect-video w-1/2 justify-self-start no-scrollbar">
                     <Image
                        src={
                           clinic.profile_picture_url.length
                              ? clinic.profile_picture_url
                              : '/agenda_ahora_logo.png'
                        }
                        alt="logo"
                        fill
                        className="object-contain"
                     />
                  </div>
               </div>
               <Sidebar
                  className="block !h-full w-full max-w-none bg-transparent !p-0"
                  noImage
                  signOutButton={
                     <SignOutButton
                        className="h-max self-end"
                        route={clinicRoutes(clinic.slug).login}
                     />
                  }
                  icons={[[BookRounded, HistoryRounded], PeopleAlt]}
                  items={[ListBox]}
               >
                  <Section title="Reservas">
                     <Item
                        textValue={
                           clinicRoutes(clinic.slug)
                              .therapist_appointments_actives
                        }
                     >
                        Activas
                     </Item>
                     <Item
                        textValue={
                           clinicRoutes(clinic.slug)
                              .therapist_appointments_history
                        }
                     >
                        Historial
                     </Item>
                  </Section>
                  <Item
                     textValue={clinicRoutes(clinic.slug).therapist_patients}
                  >
                     Pacientes
                  </Item>
               </Sidebar>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
