'use client';

import Button, { Variant } from '@/components/shared/Button';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux-hooks';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import Image from 'next/image';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import { usePathname, useRouter } from 'next/navigation';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { User } from '@/types/user';
import { GlobalRoute, clinicRoutes } from '@/lib/routes';
import { useEffect, useRef, useState } from 'react';
import { Select } from '@/components/inputs/Select';
import { Item } from 'react-stately';
import LoginModal from './LoginModal';
import PatientMobileSidebar from './PatientMobileSidebar';
import Card from '@/components/shared/cards/Card';
import SignOutButton from '@/components/sidebar/SignOutButton';
import { useMediaQuery } from '@mui/material';
import PopoverTrigger from '@/components/shared/PopoverTrigger';
import Dialog from '@/components/modal/Dialog';
import useDictionary from '@/lib/hooks/useDictionary';
import {
   DictionaryKey,
   setLanguage,
} from '@/lib/features/language/language_slice';

enum Route {
   services,
   appointments,
   other,
   completeAccount,
   profile,
}

interface IPatientHeader {
   user: User | undefined;
   slug: string;
}

export default function PatientHeader({ user, slug }: IPatientHeader) {
   const dic = useDictionary();

   const { languages, language } = useAppSelector(store => store.language);

   const dispatch = useAppDispatch();

   const router = useRouter();
   const pathname = usePathname();

   const clinic = useAppSelector(store => store.clinic);

   const { goBackRoute, value } = useAppSelector(store => store.title);

   const typeCondition = (() => {
      switch (pathname) {
         case clinicRoutes(slug).patient_complete_account:
            return Route.completeAccount;

         case clinicRoutes(slug).patient_services:
            return Route.services;

         case clinicRoutes(slug).patient_appointments_actives:
            return Route.services;

         case clinicRoutes(slug).patient_appointments_history:
            return Route.services;

         case clinicRoutes(slug).patient_profile_clinic_history:
            return Route.profile;

         case clinicRoutes(slug).patient_profile_personal_data:
            return Route.profile;

         case clinicRoutes(slug).patient_profile_personal_data_edit:
            return Route.profile;

         case clinicRoutes(slug).patient_profile_forms:
            return Route.profile;

         default:
            return Route.appointments;
      }
   })();

   const [route, setRoute] = useState(typeCondition);

   const [redirectingRoute, setRedirectingRoute] = useState<GlobalRoute>();

   const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

   const [hasBg, setHasBg] = useState(false);

   useEffect(() => {
      setRoute(
         pathname.includes(clinicRoutes(slug).patient_services)
            ? Route.services
            : pathname.includes(clinicRoutes(slug).patient_appointments)
            ? Route.appointments
            : Route.other,
      );

      setIsSideMenuOpen(false);

      if (!!user) {
         const isIncomplete = Object.entries(user).some(
            ([prop, val]) =>
               prop !== 'profile_picture' &&
               prop !== 'headquarter_id' &&
               (val === '' || val === null || val === undefined),
         );

         if (pathname === clinicRoutes(slug).patient_complete_account) {
            !isIncomplete && router.push(clinicRoutes(slug).patient_services);
         } else {
            isIncomplete &&
               router.push(clinicRoutes(slug).patient_complete_account);
         }
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [pathname]);

   useEffect(() => {
      setHasBg(
         typeCondition === Route.services ||
            typeCondition === Route.completeAccount ||
            typeCondition === Route.profile,
      );
   }, [typeCondition]);

   const title = value.split('/').at(-1);

   return (
      <>
         <PatientMobileSidebar
            setIsOpen={setIsSideMenuOpen}
            isOpen={isSideMenuOpen}
         />
         <LoginModal
            setIsOpen={val => !val && setRedirectingRoute(undefined)}
            isOpen={!!redirectingRoute}
            redirectRoute={redirectingRoute}
         />
         <header className="sticky top-0 z-20 flex w-full grid-cols-4 items-center justify-between gap-5 bg-foundation p-5 shadow lg:grid-cols-2 lg:p-10">
            <div className="lg:hidden">
               <Button
                  aria-label="menu button"
                  className="w-max bg-transparent !p-0 !text-on-background-light"
                  onPress={() => setIsSideMenuOpen(true)}
               >
                  <MenuRoundedIcon />
               </Button>
            </div>
            <div className="relative aspect-[81/34] w-20 justify-self-end lg:w-28 lg:justify-self-center">
               <Image
                  alt="clinic logo"
                  src={
                     clinic.profile_picture_url.length
                        ? clinic.profile_picture_url
                        : '/agenda_ahora_logo.png'
                  }
                  fill
                  className="object-contain"
               />
            </div>
            <div className="flex items-center gap-5">
               <Select
                  className="!bg-light-gray-background !fill-black !text-black"
                  selectedKey={language}
                  onSelectionChange={key =>
                     dispatch(setLanguage(key as DictionaryKey))
                  }
               >
                  {languages.map(({ name, key }) => (
                     <Item key={key} textValue={name}>
                        <div className="w-max px-8 py-3">{name}</div>
                     </Item>
                  ))}
               </Select>
               <Select
                  // aria-label="patients header appointments selector"
                  className={`hidden rounded-none bg-transparent !py-3 font-normal !text-on-background-text !shadow-none lg:flex ${
                     route === Route.appointments &&
                     'border-b-4 border-secondary font-semibold !text-secondary'
                  }`}
                  triggerContent={dic.texts.appointments.my_appointments}
                  onSelectionChange={val => {
                     !!user
                        ? router.push(val.toString())
                        : setRedirectingRoute(val.toString() as any);
                  }}
                  selectedKey={null}
               >
                  <Item
                     key={
                        clinicRoutes(clinic.slug).patient_appointments_actives
                     }
                     textValue={dic.texts.appointments.active_appointments}
                  >
                     <div className="w-max px-8 py-3">
                        {dic.texts.appointments.active_appointments}
                     </div>
                  </Item>
                  <Item
                     key={
                        clinicRoutes(clinic.slug).patient_appointments_history
                     }
                     textValue={dic.texts.appointments.appointments_history}
                  >
                     <div className="w-max px-8 py-3">
                        {dic.texts.appointments.appointments_history}
                     </div>
                  </Item>
               </Select>
               <Button
                  className={`mr-24 hidden !h-full w-max rounded-none bg-transparent !py-3 font-normal !text-on-background-text !shadow-none lg:block ${
                     route === Route.services &&
                     'border-b-4 border-secondary font-semibold !text-secondary'
                  }`}
                  href={clinicRoutes(clinic.slug).patient_services}
               >
                  {dic.texts.services.services}
               </Button>
               <UserButton user={user} />
            </div>
         </header>
         <div
            id="patient-navbar"
            className={`relative w-full bg-cover bg-right bg-no-repeat px-5 py-6 transition-all lg:px-12 lg:py-11 ${
               hasBg ? 'bg-primary bg-waves' : 'bg-primary-200'
            }`}
         >
            <div className="flex flex-wrap items-center gap-5">
               <p className="w-full text-xs lg:text-sm">
                  {!hasBg && (
                     <>
                        {title?.length ? value.replace(title, '') : true}{' '}
                        <span className="font-semibold text-secondary">
                           {title}
                        </span>
                     </>
                  )}
               </p>
               {typeof goBackRoute === 'string' && (
                  <Button
                     className="flex aspect-square !w-6 items-center justify-center !rounded-full bg-white !p-0 !text-black lg:!w-8"
                     href={goBackRoute}
                  >
                     <ArrowBackRoundedIcon className="text-xl lg:text-2xl" />
                  </Button>
               )}
               {value.length ? (
                  <h3 className="text-xl lg:text-2xl">{title?.trim()}</h3>
               ) : (
                  true
               )}
            </div>
         </div>
         <div id="aux-container" className="h-max" />
      </>
   );
}

interface IUserButton {
   user: User | undefined;
}

function UserButton({ user }: IUserButton) {
   const dic = useDictionary();

   const slug = useAppSelector(store => store.clinic.slug);

   const [isOpen, setIsOpen] = useState(false);

   const isLg = useMediaQuery('(min-width:1024px)');

   useEffect(() => {
      !isLg && setIsOpen(false);
   }, [isLg]);

   return (
      <>
         {!!user ? (
            <>
               <div className="flex items-center justify-end gap-3">
                  <Button
                     aria-label="menu button"
                     className="flex h-max w-max items-center bg-transparent !p-0 !text-on-background-light"
                  >
                     <NotificationsRoundedIcon />
                  </Button>
                  {isLg && (
                     <PopoverTrigger
                        onOpenChange={setIsOpen}
                        isOpen={isOpen}
                        className="w-max !rounded-full bg-transparent !p-0"
                        trigger={
                           <div className="relative aspect-square h-max w-8 overflow-hidden rounded-full">
                              <Image
                                 src={
                                    user.profile_picture.length
                                       ? user.profile_picture
                                       : '/default_profile_picture.svg'
                                 }
                                 className="rounded-full object-cover object-center"
                                 alt="profile picture"
                                 fill
                              />
                           </div>
                        }
                     >
                        {
                           <Dialog>
                              <Card className="hidden w-full min-w-[25vw] max-w-sm flex-col items-center gap-6 rounded-md lg:flex">
                                 <div className="relative aspect-square h-max w-20 overflow-hidden rounded-full">
                                    <Image
                                       src={
                                          user?.profile_picture.length
                                             ? user?.profile_picture
                                             : '/default_profile_picture.svg'
                                       }
                                       className="rounded-full object-cover object-center"
                                       alt="profile picture"
                                       fill
                                    />
                                 </div>
                                 <div className="w-full text-center">
                                    <p className="w-full truncate text-lg font-semibold">
                                       {user.names} {user.last_names}
                                    </p>
                                    <p className="w-full truncate text-on-background-text">
                                       {user.email}
                                    </p>
                                 </div>
                                 <Button
                                    href={
                                       clinicRoutes(slug)
                                          .patient_profile_personal_data
                                    }
                                    variant={Variant.secondary}
                                 >
                                    {dic.texts.flows.see_profile}
                                 </Button>
                                 <SignOutButton
                                    className="!h-max !bg-transparent !text-error"
                                    route={clinicRoutes(slug).login}
                                 />
                              </Card>
                           </Dialog>
                        }
                     </PopoverTrigger>
                  )}
               </div>
            </>
         ) : (
            <div className="hidden min-w-[23rem] grid-cols-2 gap-5 lg:grid">
               <Button
                  variant={Variant.secondary}
                  className="w-full min-w-max bg-transparent !py-3"
                  href={clinicRoutes(slug).login}
               >
                  {dic.texts.flows.login}
               </Button>
               <Button className="!py-3" href={clinicRoutes(slug).register}>
                  {dic.texts.flows.sign_up}
               </Button>
            </div>
         )}
      </>
   );
}
