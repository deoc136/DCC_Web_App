'use client';

import Dialog from '@/components/modal/Dialog';
import { ListBox } from '@/components/shared/ListBox';
import PopoverTrigger from '@/components/shared/PopoverTrigger';
import { ClinicPopulated } from '@/types/clinic';
import Image from 'next/image';
import { Item } from 'react-stately';
import CircleRoundedIcon from '@mui/icons-material/Circle';
import CircleOutlinedRoundedIcon from '@mui/icons-material/CircleOutlined';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import { Headquarter as IHeadquarter } from '@/types/headquarter';
import Headquarter from '@/components/shared/cards/Headquarter';
import { User } from '@/types/user';
import UserOverviewCard from '@/components/shared/cards/AdminOverviewCard';
import { useEffect, useMemo, useState } from 'react';
import Button from '@/components/shared/Button';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { useRouter } from 'next/navigation';
import { SORoutes } from '@/lib/routes';
import { editClinic } from '@/services/clinic';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import usePhoneCode from '@/lib/hooks/usePhoneCode';

interface IClinicOverview {
   data: ClinicPopulated;
   headquarters: IHeadquarter[];
   users: User[];
}

export default function ClinicOverview({
   data,
   headquarters,
   users,
}: IClinicOverview) {
   const router = useRouter();

   const [isChanging, setIsChanging] = useState(false);

   const { cities, countries, identification_types, phone_codes } =
      useAppSelector(store => store.catalogues);

   const admin = useMemo(
      () =>
         users.find(user => user.cognito_id === data.clinic.administrator_id),
      [users, data.clinic.administrator_id],
   );

   const code = usePhoneCode();

   async function toggleState() {
      if (isChanging) return;

      setIsChanging(true);

      try {
         const newValue = !data.clinic.active;

         await editClinic({ ...data.clinic, active: newValue });

         router.refresh();
      } catch (error) {}
   }

   useEffect(() => {
      setIsChanging(false);
   }, [data.clinic.active]);

   return (
      <div className="mb-12 grid gap-10">
         <section className="grid w-full grid-cols-[auto_auto_1fr] gap-5">
            <div className="relative aspect-video h-full w-32 overflow-hidden">
               <Image
                  className="object-contain"
                  alt="clinic image"
                  fill
                  src={data.clinic.profile_picture_url}
               />
            </div>
            <div className="flex flex-col justify-center gap-3">
               <h2 className="font-semibold">{data.clinic.name}</h2>
               <PopoverTrigger
                  trigger={
                     <div
                        className={`flex w-max justify-end gap-2 rounded-md !bg-foundation p-3 font-normal !text-black ${
                           !data.clinic.active && '!text-on-background-disabled'
                        }`}
                     >
                        {isChanging ? (
                           <RefreshRoundedIcon className="animate-spin" />
                        ) : data.clinic.active ? (
                           <>
                              <CircleRoundedIcon className="!fill-success" />
                              Activo
                           </>
                        ) : (
                           <>
                              <CircleOutlinedRoundedIcon />
                              Inactivo
                           </>
                        )}
                        <ArrowDropDownRoundedIcon className="!fill-on-background-text" />
                     </div>
                  }
               >
                  <Dialog className="rounded">
                     <ListBox className="right-0 !p-0 shadow-xl">
                        {isChanging ? (
                           <Item textValue="Cambiando">
                              <div className="w-full p-3 text-start">
                                 Cambiando...
                              </div>
                           </Item>
                        ) : data.clinic.active ? (
                           <Item textValue="Desactivar">
                              <button
                                 disabled={isChanging}
                                 onClick={toggleState}
                                 className="w-full p-3 text-start"
                              >
                                 Desactivar
                              </button>
                           </Item>
                        ) : (
                           <Item textValue="Activar">
                              <button
                                 disabled={isChanging}
                                 onClick={toggleState}
                                 className="w-full p-3 text-start"
                              >
                                 Activar
                              </button>
                           </Item>
                        )}
                     </ListBox>
                  </Dialog>
               </PopoverTrigger>
            </div>
            <Button
               href={SORoutes.management_clinic_slug(data.clinic.slug).edit}
               className="flex h-max !w-max items-center gap-2 justify-self-end !px-5"
            >
               <EditRoundedIcon className="!fill-white" /> Editar clínica
            </Button>
         </section>
         <h3 className="text-xl">Datos Generales</h3>
         <section className="mx-24 ml-24 grid grid-cols-2 gap-5">
            <div>
               <p className="mb-2 font-semibold">País</p>
               <p className="text-on-background-text">
                  {
                     countries.find(country => country.id === data.country.id)
                        ?.name
                  }
               </p>
            </div>
            <div>
               <p className="mb-2 font-semibold">Pagina Web</p>
               <p className="text-on-background-text">
                  {(data.clinic as any).web_page}
               </p>
            </div>
            <div>
               <p className="mb-2 font-semibold">Tipo de identificación</p>
               <p className="text-on-background-text">
                  {
                     identification_types.find(
                        type => type.id === data.clinic.identification_id,
                     )?.name
                  }
               </p>
            </div>
            <div>
               <p className="mb-2 font-semibold">Número de identificación</p>
               <p className="text-on-background-text">
                  {data.clinic.identification}
               </p>
            </div>
            <div>
               <p className="mb-2 font-semibold">PayPal client ID</p>
               <p className="w-full truncate text-on-background-text">
                  {data.clinic.paypal_id}
               </p>
            </div>
            <div>
               <p className="mb-2 font-semibold">PayPal secret key</p>
               <p className="w-full truncate text-on-background-text">
                  {data.clinic.paypal_secret_key}
               </p>
            </div>
         </section>
         <h3 className="text-xl">Datos de contacto</h3>
         <section className="mx-24 grid gap-10">
            {headquarters.map(headquarter => (
               <Headquarter
                  code={code}
                  key={headquarter.index}
                  cities={cities}
                  headquarter={headquarter}
               />
            ))}
         </section>
         {admin && (
            <>
               <h3 className="text-xl">
                  Datos del Administrador Master de la clínica
               </h3>
               <section className="mx-24">
                  <UserOverviewCard
                     code={code}
                     admin={{
                        ...admin,
                        lastNames: admin.last_names,
                        image: '',
                     }}
                  />
               </section>
            </>
         )}
      </div>
   );
}
