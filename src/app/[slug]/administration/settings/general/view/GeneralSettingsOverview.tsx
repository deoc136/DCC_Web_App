'use client';

import { ClinicPopulated } from '@/types/clinic';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux-hooks';
import { Headquarter as IHeadquarter } from '@/types/headquarter';
import { User } from '@/types/user';
import { useEffect, useMemo, useState } from 'react';
import Button from '@/components/shared/Button';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { useRouter } from 'next/navigation';
import { clinicRoutes } from '@/lib/routes';
import UserOverviewCard from '@/components/shared/cards/AdminOverviewCard';
import Headquarter from '@/components/shared/cards/Headquarter';
import Switch from '@/components/shared/Switch';
import { editClinic } from '@/services/clinic';
import ComboBox from '@/components/inputs/ComboBox';
import { Item } from 'react-stately';
import { setClinic } from '@/lib/features/clinic/clinic_slice';
import usePhoneCode from '@/lib/hooks/usePhoneCode';

interface IGeneralSettingsOverview {
   data: ClinicPopulated;
   headquarters: IHeadquarter[];
   users: User[];
}

export default function GeneralSettingsOverview({
   data,
   headquarters,
   users,
}: IGeneralSettingsOverview) {
   const router = useRouter();

   const { cities, countries, identification_types, phone_codes } =
      useAppSelector(store => store.catalogues);

   const dispatch = useAppDispatch();

   const currencies = useAppSelector(store => store.currencies);

   const [updating, setUpdating] = useState(false);

   const [updatingCurrencyError, setUpdatingCurrencyError] = useState(false);

   const admin = useMemo(
      () =>
         users.find(user => user.cognito_id === data.clinic.administrator_id),
      [users, data.clinic.administrator_id],
   );

   const code = usePhoneCode();

   useEffect(() => {
      setUpdating(false);

      dispatch(setClinic(data.clinic));

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [data.clinic]);

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
            <h2 className="font-semibold">{data.clinic.name}</h2>
            <Button
               href={clinicRoutes(data.clinic.slug).admin_settings_general_edit}
               className="flex h-max !w-max items-center gap-2 justify-self-end !px-14"
            >
               <EditRoundedIcon className="!fill-white" /> Editar
            </Button>
         </section>
         <h3 className="text-xl">Datos Generales</h3>
         <section className="mx-24 grid grid-cols-2 gap-5">
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
            {headquarters
               .filter(({ removed }) => !removed)
               .map(headquarter => (
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
         <h3 className="text-xl">Configurar permisos del equipo</h3>
         <section className="mx-24 grid gap-5">
            <div className="flex justify-between ">
               <p className="text-on-background">
                  Permitir que Terapeutas puedan ver los datos personales de los
                  pacientes
               </p>
               <Switch
                  aria-label="therapist-visibility-switch"
                  isDisabled={updating}
                  onChange={async val => {
                     setUpdating(true);
                     !updating &&
                        (await editClinic({
                           ...data.clinic,
                           hide_for_therapist: !val,
                        }));
                     router.refresh();
                  }}
                  isSelected={!data.clinic.hide_for_therapist}
               />
            </div>
            <div className="flex justify-between ">
               <p className="text-on-background">
                  Permitir que Recepcionistas puedan ver los datos personales de
                  los pacientes
               </p>
               <Switch
                  aria-label="receptionist-visibility-switch"
                  isDisabled={updating}
                  onChange={async val => {
                     setUpdating(true);
                     !updating &&
                        (await editClinic({
                           ...data.clinic,
                           hide_for_receptionist: !val,
                        }));
                     router.refresh();
                  }}
                  isSelected={!data.clinic.hide_for_receptionist}
               />
            </div>
            <div className="flex justify-between ">
               <p className="text-on-background">
                  Permitir que Pacientes puedan ver los datos personales de los
                  terapeutas
               </p>
               <Switch
                  aria-label="patients-visibility-switch"
                  isDisabled={updating}
                  onChange={async val => {
                     setUpdating(true);
                     !updating &&
                        (await editClinic({
                           ...data.clinic,
                           hide_for_patients: !val,
                        }));
                     router.refresh();
                  }}
                  isSelected={!data.clinic.hide_for_patients}
               />
            </div>
         </section>
         <h3 className="text-xl">Configuración de moneda de pago</h3>
         <section className="mx-24 grid grid-cols-2 gap-5">
            <ComboBox
               isDisabled={updating}
               placeholder={(() => {
                  const country_currency_code = countries
                     .find(country => country.id === data.country.id)
                     ?.code.split('/')
                     .at(1);

                  const currency = currencies.find(
                     currency => currency.code === country_currency_code,
                  );

                  return `${currency?.name} (${currency?.code})`;
               })()}
               label="Moneda de pago"
               errorMessage={
                  updatingCurrencyError &&
                  'Ocurrió un error actualizando el tipo de moneda.'
               }
               selectedKey={data.clinic.currency_id?.toString()}
               onSelectionChange={async currency_id => {
                  try {
                     setUpdatingCurrencyError(false);
                     if (
                        !!currency_id &&
                        (!!Number(currency_id) || Number(currency_id) === 0) &&
                        currency_id !== data.clinic.currency_id
                     ) {
                        setUpdating(true);
                        await editClinic({
                           ...data.clinic,
                           currency_id: Number(currency_id),
                        });
                        router.refresh();
                     }
                  } catch (error) {
                     setUpdatingCurrencyError(true);
                     setUpdating(true);
                  }
               }}
            >
               {currencies.map(currency => (
                  <Item
                     key={currency.id.toString()}
                     textValue={`${currency.name} (${currency.code})`}
                  >
                     <div className="px-4 py-3 hover:bg-primary-100">
                        {currency.name} ({currency.code})
                     </div>
                  </Item>
               ))}
            </ComboBox>
         </section>
      </div>
   );
}
