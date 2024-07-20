'use client';

import ComboBox from '@/components/inputs/ComboBox';
import TextField from '@/components/inputs/TextField';
import Button, { Variant } from '@/components/shared/Button';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import { ClinicPopulated } from '@/types/clinic';
import { Headquarter } from '@/types/headquarter';
import { User } from '@/types/user';
import Image from 'next/image';
import { ChangeEvent, DragEvent, useMemo, useRef, useState } from 'react';
import { ZodError, z } from 'zod';
import CircleRoundedIcon from '@mui/icons-material/Circle';
import CircleOutlinedRoundedIcon from '@mui/icons-material/CircleOutlined';
import { Item } from 'react-stately';
import { clinicRoutes } from '@/lib/routes';
import { useRouter } from 'next/navigation';
import { onlyLettersRegex, onlyNumbersRegex } from '@/lib/regex';
import {
   maxLengthError,
   nonEmptyMessage,
   nonUnselectedMessage,
} from '@/lib/validations';
import { editClinic, getAllClinicsPopulated } from '@/services/clinic';
import { AxiosError } from 'axios';
import { translateError } from '@/lib/amplify_aux/error_messages';
import { IAmplifyError } from '@/types/amplify';
import {
   createHeadquarter,
   deleteHeadquarter,
   editHeadquarter,
} from '@/services/headquarter';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Dialog from '@/components/modal/Dialog';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { uploadFile } from '@/services/files';
import EditingHeadquarter from '@/components/shared/cards/EditingHeadquarter';
import UserOverviewCard from '@/components/shared/cards/AdminOverviewCard';
import { ChangeValuesFunction } from '@/app/software-owner/management/clinics/[slug]/edit/views/EditView';
import ChangeImageModal from '@/components/shared/modals/ChangeImageModal';
import CancelConfirmationModal from '@/components/shared/modals/CancelConfirmationModal';
import Switch from '@/components/shared/Switch';
import usePhoneCode from '@/lib/hooks/usePhoneCode';

interface IGeneralSettingsEdit {
   data: ClinicPopulated;
   headquarters: Headquarter[];
   users: User[];
}

export default function GeneralSettingsEdit({
   data,
   headquarters,
   users,
}: IGeneralSettingsEdit) {
   const router = useRouter();

   const { cities, countries, identification_types, phone_codes } =
      useAppSelector(store => store.catalogues);

   const currencies = useAppSelector(store => store.currencies);

   const [isSending, setIsSending] = useState(false);
   const [isOpen, setIsOpen] = useState(false);

   const [values, setValues] = useState({
      ...{
         ...data,
         clinic: {
            ...data.clinic,
            country: data.clinic.country.toString(),
            identification_id: data.clinic.identification_id.toString(),
         },
      },
      headquarters: headquarters
         .filter(({ removed }) => !removed)
         .map(quarter => ({
            ...quarter,
            city: quarter.city.toString(),
         })),
      users,
   });

   const valuesSchema = z.object({
      clinic: z.object({
         active: z.boolean(),
         country: z.string().nonempty(nonUnselectedMessage),
         identification: z.string().nonempty(nonEmptyMessage),
         identification_id: z.string().nonempty(nonUnselectedMessage),
         name: z
            .string()
            .nonempty(nonEmptyMessage)
            .max(70, maxLengthError(70))
            .regex(
               onlyLettersRegex,
               'El nombre solo puede contener letras y espacios.',
            ),
         web_page: z
            .string()
            .url('La URL debe tener un formato correcto.')
            .nonempty(nonEmptyMessage),
         paypal_id: z.string().nonempty(nonEmptyMessage),
         paypal_secret_key: z.string().nonempty(nonEmptyMessage),
      }),
      headquarters: z.array(
         z.object({
            address: z
               .string()
               .nonempty(nonEmptyMessage)
               .max(200, maxLengthError(200)),
            city: z.string().nonempty(nonUnselectedMessage),
            name: z
               .string()
               .nonempty(nonEmptyMessage)
               .max(70, maxLengthError(70))
               .regex(
                  onlyLettersRegex,
                  'El nombre solo puede contener letras y espacios.',
               ),
            phone: z
               .string()
               .nonempty(nonEmptyMessage)
               .max(20, maxLengthError(20))
               .regex(
                  onlyNumbersRegex,
                  'El teléfono solo puede contener números y espacios.',
               ),
            index: z.number(),
         }),
      ),
   });

   const [newImage, setNewImage] = useState<File | string>();

   const [errors, setErrors] = useState<ZodError['errors']>();
   const [editionError, setEditionError] = useState<string>();

   const [isChangingImage, setIsChangingImage] = useState(false);

   const [closingOpen, setClosingOpen] = useState(false);

   const changeValues: ChangeValuesFunction = (tree, param, value, index) => {
      setValues(prev => {
         if (Array.isArray(prev[tree])) {
            const aux = prev as Pick<typeof prev, 'headquarters' | 'users'>;

            const object = aux[tree as keyof typeof aux];

            let element = object[index as number];

            element = {
               ...element,
               [param as keyof typeof element]: value,
            };

            object[index as number] = element;

            return { ...prev, [tree]: object };
         } else {
            let aux = prev as Omit<typeof prev, 'headquarters' | 'users'>;

            let object = aux[tree as keyof typeof aux];

            object = { ...object, [param as keyof typeof object]: value };

            return { ...prev, [tree]: object };
         }
      });
   };

   function resetCatalogues() {
      setValues(prev => {
         const headquarters = prev.headquarters;

         headquarters.forEach(quarter => (quarter.city = ''));

         return {
            ...prev,
            clinic: { ...prev.clinic, identification_id: '' },
            headquarters,
         };
      });
   }

   function deleteHeadquarterEdition(index: number) {
      setValues(prev => {
         const aux = { ...prev };

         aux.headquarters.splice(index, 1);

         return aux;
      });
   }

   const admin = useMemo(
      () =>
         users.find(user => user.cognito_id === values.clinic.administrator_id),
      [users, values.clinic.administrator_id],
   );

   const code = usePhoneCode();

   const inputFileRef = useRef<HTMLInputElement>(null);

   async function dropHandler(e: DragEvent<HTMLDivElement>) {
      e.currentTarget.classList.remove('border-primary', '!border-solid');

      let file: File | undefined | null = undefined;

      e.preventDefault();

      if (e.dataTransfer.items) {
         file = [...e.dataTransfer.items].at(0)?.getAsFile();
      } else {
         file = [...e.dataTransfer.items].at(0);
      }

      setNewImage(() => {
         if (file) {
            if (file.size > 10000000) {
               return 'El tamaño es mayor al indicado';
            } else if (
               file.type === 'image/png' ||
               file.type === 'image/jpg' ||
               file.type === 'image/jpeg'
            ) {
               return file;
            } else {
               return 'Ingresar un tipo de archivo valido';
            }
         }
      });
   }

   async function imageInputHandler(e: ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.item(0);

      setNewImage(() => {
         if (file) {
            if (file.size > 10000000) {
               return 'El tamaño es mayor al indicado';
            } else if (
               file.type === 'image/png' ||
               file.type === 'image/jpg' ||
               file.type === 'image/jpeg'
            ) {
               return file;
            } else {
               return 'Ingresar un tipo de archivo valido';
            }
         }
      });
   }

   async function edit() {
      if (isSending) return;

      setIsSending(true);
      setErrors(undefined);
      setEditionError(undefined);

      try {
         if (
            (await getAllClinicsPopulated()).data.filter(
               data => data.clinic.name === values.clinic.name,
            ).length > 1
         ) {
            setEditionError(
               'El nombre de clínica ingresado no está disponible.',
            );
            setIsSending(false);
            return;
         }

         let imageUrl = values.clinic.profile_picture_url;

         if (newImage) {
            try {
               if (newImage && typeof newImage !== 'string') {
                  imageUrl = (await uploadFile(newImage)).data;
               }
            } catch (error) {
               setIsSending(false);
               throw Error('Ocurrió un error subiendo la imagen.');
            }
         }

         let admin_id = values.clinic.administrator_id;

         try {
            await editClinic({
               ...values.clinic,
               country: Number(values.clinic.country),
               identification_id: Number(values.clinic.identification_id),
               profile_picture_url: imageUrl,
               administrator_id: admin_id,
            });
         } catch (error) {
            throw Error('Sucedió un error editando la clínica.');
         }

         try {
            await Promise.all([
               ...values.headquarters.map(async quarter => {
                  if (quarter.id === undefined) {
                     (
                        await createHeadquarter(
                           {
                              ...quarter,
                              city: Number(quarter.city),
                           },
                           values.clinic.slug,
                        )
                     ).data;
                  } else {
                     (
                        await editHeadquarter(
                           {
                              ...quarter,
                              city: Number(quarter.city),
                           },
                           values.clinic.slug,
                        )
                     ).data;
                  }
               }),
               ...headquarters.map(
                  quarter =>
                     !values.headquarters.some(
                        $quarter => $quarter.id === quarter.id,
                     ) &&
                     quarter.id &&
                     editHeadquarter(
                        {
                           ...quarter,
                           removed: true,
                        },
                        values.clinic.slug,
                     ),
               ),
            ]);
         } catch (error) {
            throw Error('Sucedió un error inesperado.');
         }

         router.refresh();

         setIsOpen(true);
      } catch (error) {
         if ((error as AxiosError).response?.status === 409) {
            setEditionError(
               'El nombre de clínica ingresado no está disponible.',
            );
         } else {
            setEditionError(translateError(error as IAmplifyError));
         }
      }

      setIsSending(false);
   }

   return (
      <>
         <CancelConfirmationModal
            isOpen={closingOpen}
            setIsOpen={setClosingOpen}
            route={clinicRoutes(values.clinic.slug).admin_settings_general}
         />
         <ChangeImageModal
            dropHandler={dropHandler}
            imageInputHandler={imageInputHandler}
            inputFileRef={inputFileRef}
            isOpen={isChangingImage}
            setIsOpen={setIsChangingImage}
            file={newImage}
            clearFile={() => setNewImage(undefined)}
         />
         <SuccessModal isOpen={isOpen} slug={values.clinic.slug} />
         <section className="grid grid-cols-[1fr_1fr] gap-5">
            <div className="flex items-center gap-5">
               <Button
                  onPress={() => setIsChangingImage(true)}
                  className="relative aspect-video !w-32 flex-none border border-primary bg-transparent"
               >
                  <Image
                     className="object-contain"
                     src={(() => {
                        if (newImage) {
                           if (newImage && typeof newImage !== 'string') {
                              return URL.createObjectURL(newImage);
                           } else {
                              return '';
                           }
                        } else {
                           return values.clinic.profile_picture_url;
                        }
                     })()}
                     alt="Clinic image"
                     fill
                  />
               </Button>
               <div className="w-full">
                  <TextField
                     aria-label="Clinic name input"
                     className="w-full"
                     placeholder="Ingresar nombre"
                     value={values.clinic.name}
                     errorMessage={
                        errors?.find(
                           error =>
                              error.path.at(0) === 'clinic' &&
                              error.path.at(1) === 'name',
                        )?.message
                     }
                     onChange={val => {
                        if (onlyLettersRegex.test(val) || val === '') {
                           changeValues('clinic', 'name', val, null);
                        }
                     }}
                  />
                  <div className="mt-3 flex items-center gap-2">
                     {data.clinic.active ? (
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
                  </div>
               </div>
            </div>
            <div className="flex flex-wrap justify-end gap-5 justify-self-end">
               {editionError && (
                  <div className="w-full flex-none text-end text-error">
                     {editionError}
                  </div>
               )}
               <Button
                  className="h-min w-max !px-12"
                  variant={Variant.secondary}
                  isDisabled={isSending}
                  onPress={() => setClosingOpen(true)}
               >
                  Cancelar
               </Button>
               <Button
                  isDisabled={isSending}
                  onPress={() => {
                     const administratorParsing =
                        valuesSchema.safeParse(values);

                     !administratorParsing.success
                        ? setErrors(administratorParsing.error.errors)
                        : edit();
                  }}
                  className="h-min w-max !px-12"
               >
                  {isSending ? (
                     <>
                        Cargando...
                        <RefreshRoundedIcon className="animate-spin" />
                     </>
                  ) : (
                     'Guardar'
                  )}
               </Button>
            </div>
         </section>
         <h3 className="mt-10 text-xl font-semibold">Datos Generales</h3>
         <section className="mx-24 my-10 grid grid-cols-2 gap-5">
            <ComboBox
               id="country-switcher"
               placeholder="Ingresar país"
               label="País"
               selectedKey={values.clinic.country}
               errorMessage={
                  errors?.find(
                     error =>
                        error.path.at(0) === 'clinic' &&
                        error.path.at(1) === 'country',
                  )?.message
               }
               onSelectionChange={val => {
                  changeValues('clinic', 'country', (val ?? '') as any, null);
                  resetCatalogues();
               }}
            >
               {countries.map(country => (
                  <Item key={country.id} textValue={country.name}>
                     <div className="px-4 py-3 hover:bg-primary-100">
                        {country.name}
                     </div>
                  </Item>
               ))}
            </ComboBox>
            <TextField
               label="Página Web"
               placeholder="Ingresar URL"
               value={values.clinic.web_page}
               errorMessage={
                  errors?.find(
                     error =>
                        error.path.at(0) === 'clinic' &&
                        error.path.at(1) === 'web_page',
                  )?.message
               }
               onChange={val => changeValues('clinic', 'web_page', val, null)}
            />
            <ComboBox
               id="id_type-switcher"
               placeholder="Ingresar tipo"
               label="Tipo de identificación"
               selectedKey={values.clinic.identification_id}
               onSelectionChange={val =>
                  changeValues(
                     'clinic',
                     'identification_id',
                     (val ?? '') as any,
                     null,
                  )
               }
               errorMessage={
                  errors?.find(
                     error =>
                        error.path.at(0) === 'clinic' &&
                        error.path.at(1) === 'identification_id',
                  )?.message
               }
               isDisabled={!values.clinic.country}
            >
               {identification_types
                  .filter(
                     type =>
                        type.parent_catalog_id.toString() ===
                        values.clinic.country,
                  )
                  .map(type => (
                     <Item key={type.id} textValue={type.name}>
                        <div className="px-4 py-3 hover:bg-primary-100">
                           {type.name}
                        </div>
                     </Item>
                  ))}
            </ComboBox>
            <TextField
               label="Número de identificación"
               placeholder="Ingresar número"
               value={values.clinic.identification}
               errorMessage={
                  errors?.find(
                     error =>
                        error.path.at(0) === 'clinic' &&
                        error.path.at(1) === 'identification',
                  )?.message
               }
               onChange={val =>
                  changeValues('clinic', 'identification', val, null)
               }
            />
            <TextField
               label="PayPal client ID"
               placeholder="Ingresar el identificador"
               value={values.clinic.paypal_id}
               errorMessage={
                  errors?.find(
                     error =>
                        error.path.at(0) === 'clinic' &&
                        error.path.at(1) === 'paypal_id',
                  )?.message
               }
               onChange={val => changeValues('clinic', 'paypal_id', val, null)}
            />
            <TextField
               label="PayPal secret key"
               placeholder="Ingresar el key"
               value={values.clinic.paypal_secret_key}
               errorMessage={
                  errors?.find(
                     error =>
                        error.path.at(0) === 'clinic' &&
                        error.path.at(1) === 'paypal_secret_key',
                  )?.message
               }
               onChange={val =>
                  changeValues('clinic', 'paypal_secret_key', val, null)
               }
            />
         </section>
         <h3 className="text-xl font-semibold">Datos de contacto</h3>
         <section className="mx-24 mt-10 grid gap-10">
            {values.headquarters
               .sort((a, b) => a.index - b.index)
               .map((quarter, i) => (
                  <EditingHeadquarter
                     key={i}
                     i={i}
                     changeValues={changeValues}
                     cities={cities}
                     country={values.clinic.country}
                     errors={errors}
                     quarter={quarter}
                     deleteHeadquarter={deleteHeadquarterEdition}
                     allowDelete={false}
                  />
               ))}
         </section>
         <h3 className="mt-10 text-xl font-semibold">Datos Generales</h3>
         {admin && (
            <section className="mx-24 my-10">
               <UserOverviewCard
                  admin={{
                     ...admin,
                     lastNames: admin.last_names,
                     image: '',
                  }}
                  code={code}
               />
            </section>
         )}
         <div className="my-10 grid cursor-default gap-10 opacity-50">
            <h3 className="text-xl">Configurar permisos del equipo</h3>
            <section className="mx-24 ml-24 grid gap-5">
               <div className="flex justify-between ">
                  <p className="text-on-background">
                     Permitir que Terapeutas puedan ver los datos personales de
                     los pacientes
                  </p>
                  <Switch
                     aria-label="therapist-visibility-switch"
                     isDisabled
                     isSelected={!data.clinic.hide_for_therapist}
                  />
               </div>
               <div className="flex justify-between ">
                  <p className="text-on-background">
                     Permitir que Recepcionistas puedan ver los datos personales
                     de los pacientes
                  </p>
                  <Switch
                     aria-label="receptionist-visibility-switch"
                     isDisabled
                     isSelected={!data.clinic.hide_for_receptionist}
                  />
               </div>
               <div className="flex justify-between ">
                  <p className="text-on-background">
                     Permitir que Pacientes puedan ver los datos personales de
                     los terapeutas
                  </p>
                  <Switch
                     aria-label="patients-visibility-switch"
                     isDisabled
                     isSelected={!data.clinic.hide_for_patients}
                  />
               </div>
            </section>
            <h3 className="text-xl">Configuración de moneda de pago</h3>
            <section className="mx-24 grid grid-cols-2 gap-5">
               <TextField
                  isDisabled
                  placeholder={(country => `${country?.code.split('/').at(1)}`)(
                     countries.find(country => country.id === data.country.id),
                  )}
                  label="Moneda de pago"
                  value={(currency =>
                     currency
                        ? `${currency.name} (${currency.code})`
                        : undefined)(
                     currencies.find(
                        currency => currency.id === data.clinic.currency_id,
                     ),
                  )}
               />
            </section>
         </div>
      </>
   );
}

function SuccessModal({ slug, isOpen }: { slug: string; isOpen: boolean }) {
   const router = useRouter();

   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="flex flex-col items-center gap-9 rounded-xl p-8 sm:p-14">
               <CheckCircleRoundedIcon className="!text-8xl text-primary" />
               <div>
                  <h3 className="mb-3 text-center text-xl">
                     Tus cambios se han guardado
                  </h3>
                  <p className="px-14 text-center !text-base !font-normal text-on-background-text body-1">
                     Podrás ver tus cambios actualizados en configuración
                  </p>
               </div>
               <Button
                  className="max-w-[70%]"
                  href={clinicRoutes(slug).admin_settings_general}
               >
                  Entiendo
               </Button>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
