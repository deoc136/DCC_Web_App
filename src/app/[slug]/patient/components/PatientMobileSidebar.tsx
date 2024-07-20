'use client';

import Dialog, { IDialog } from '@/components/modal/Dialog';
import { IModal } from '@/components/modal/Modal';
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
import { useRouter } from 'next/navigation';

interface IPatientMobileSidebar {
   isOpen: boolean;
   setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export default function PatientMobileSidebar({
   isOpen,
   setIsOpen,
}: IPatientMobileSidebar) {
   const clinic = useAppSelector(store => store.clinic);
   const user = useAppSelector(store => store.user);

   const isLg = useMediaQuery('(min-width:1024px)');

   const router = useRouter();

   useEffect(() => {
      isLg && setIsOpen(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [isLg]);

   return (
      <ModalTrigger
         className="bot-0 absolute left-0 top-0 translate-x-0 animate-slide lg:hidden"
         isOpen={isOpen}
      >
         {() => (
            <Dialog className="grid h-screen max-h-none w-[90vw] grid-rows-[auto_auto_1fr] !bg-foundation pb-5 pt-10 md:w-[40vw]">
               <div className="mb-5 grid gap-5 px-5">
                  <Button
                     className="ml-auto !w-max bg-transparent !p-0"
                     onPress={() => {
                        setIsOpen(false);
                     }}
                  >
                     <CloseRoundedIcon className="!fill-black" />
                  </Button>
                  {!!user ? (
                     <>
                        <div className="grid grid-cols-[auto_1fr] gap-4">
                           <div className="relative aspect-square h-max w-14">
                              <Image
                                 src={
                                    user.profile_picture.length
                                       ? user.profile_picture
                                       : '/default_profile_picture.svg'
                                 }
                                 className="rounded-full object-cover object-center"
                                 alt="patient profile picture"
                                 fill
                              />
                           </div>
                           <div className="flex flex-col justify-between">
                              <p className="w-full truncate font-semibold">
                                 {user.names} {user.last_names}
                              </p>
                              <p className="text-sm text-on-background-text">
                                 {user.email}
                              </p>
                           </div>
                        </div>
                        <Button
                           href={
                              clinicRoutes(clinic.slug)
                                 .patient_profile_personal_data
                           }
                           variant={Variant.secondary}
                        >
                           Ver perfil
                        </Button>
                     </>
                  ) : (
                     <>
                        <Button href={clinicRoutes(clinic.slug).login}>
                           Iniciar sesión
                        </Button>
                        <Button
                           href={clinicRoutes(clinic.slug).register}
                           variant={Variant.secondary}
                        >
                           Registrarse
                        </Button>
                     </>
                  )}
               </div>
               <hr className="border-on-background-text" />
               <Sidebar
                  className="block !h-full w-full max-w-none bg-transparent !p-0"
                  noImage
                  signOutButton={
                     <div className="flex h-full items-end">
                        <SignOutButton
                           className="!h-max !bg-transparent !text-error"
                           route={clinicRoutes(clinic.slug).login}
                        />
                     </div>
                  }
                  items={[ListBox]}
               >
                  <Item textValue={clinicRoutes(clinic.slug).patient_services}>
                     Servicios
                  </Item>
                  {!!user ? (
                     <Section title="Mis citas">
                        <Item
                           textValue={
                              clinicRoutes(clinic.slug)
                                 .patient_appointments_actives
                           }
                        >
                           Citas agendadas
                        </Item>
                        <Item
                           textValue={
                              clinicRoutes(clinic.slug)
                                 .patient_appointments_history
                           }
                        >
                           Historial de citas
                        </Item>
                     </Section>
                  ) : (
                     (true as any)
                  )}
               </Sidebar>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
