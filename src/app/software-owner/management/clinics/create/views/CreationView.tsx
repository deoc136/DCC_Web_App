'use client';

import { changeTitle } from '@/lib/features/title/title_slice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux-hooks';
import { SORoutes } from '@/lib/routes';
import { useEffect, useState } from 'react';
import Button, { Variant } from '@/components/shared/Button';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useRouter } from 'next/navigation';
import {
   createClinic,
   createClinicFullFilled,
   getClinicBySlug,
} from '@/services/clinic';
import { AxiosError } from 'axios';
import { ZodError, z } from 'zod';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Dialog from '@/components/modal/Dialog';
import { ClinicCreationState, clinicInitialValues } from '../values';
import ClinicForm from './ClinicForm';
import AdministratorForm from './AdministratorForm';
import ClinicPreview from './ClinicPreview';
import { onlyLettersRegex, onlyNumbersRegex } from '@/lib/regex';
import {
   maxLengthError,
   nonEmptyMessage,
   nonUnselectedMessage,
} from '@/lib/validations';
import { uploadFile } from '@/services/files';
import CreationState from '@/components/shared/CreationState';

export default function CreationView() {
   const administratorSchema = z.object({
      email: z
         .string()
         .nonempty(nonEmptyMessage)
         .email('El email debe tener un formato correcto.'),

      names: z
         .string()
         .nonempty(nonEmptyMessage)
         .max(70, maxLengthError(70))
         .regex(
            onlyLettersRegex,
            'El nombre solo puede contener letras y espacios.',
         ),

      lastNames: z
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
   });

   const valuesSchema = z.object({
      active: z.boolean(),
      country: z.string().nonempty(nonUnselectedMessage),
      document: z.string().nonempty(nonEmptyMessage),
      documentType: z.string().nonempty(nonUnselectedMessage),
      name: z
         .string()
         .nonempty(nonEmptyMessage)
         .max(70, maxLengthError(70))
         .regex(
            onlyLettersRegex,
            'El nombre solo puede contener letras y espacios.',
         ),

      webPage: z
         .string()
         .url('La URL debe tener un formato correcto.')
         .nonempty(nonEmptyMessage),
      paypal_id: z.string().nonempty(nonEmptyMessage),
      paypal_secret_key: z.string().nonempty(nonEmptyMessage),
      image: z.instanceof(File, { message: nonEmptyMessage }),
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
            phoneNumber: z
               .string()
               .nonempty(nonEmptyMessage)
               .max(20, maxLengthError(20))
               .regex(
                  onlyNumbersRegex,
                  'El teléfono solo puede contener números y espacios.',
               ),
         }),
      ),
   });

   const router = useRouter();

   const [errors, setErrors] = useState<ZodError['errors']>();
   const [creationError, setCreationError] = useState<string>();

   const [creating, setCreating] = useState(false);
   const [isOpen, setIsOpen] = useState(false);

   const dispatch = useAppDispatch();

   const valuesState = useState(clinicInitialValues);

   const [values, setValues] = valuesState;
   const [state, setState] = useState(ClinicCreationState.clinic);

   const { countries, identification_types, cities } = useAppSelector(
      store => store.catalogues,
   );

   useEffect(() => {
      dispatch(
         changeTitle({
            goBackRoute: SORoutes.management_clinics,
            value: 'Administrar clínica / Crear clínica',
         }),
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   useEffect(() => {
      setValues(prev => {
         const headquarters = prev.headquarters;

         headquarters.forEach(quarter => (quarter.city = ''));

         return { ...prev, documentType: '', headquarters };
      });

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [values.country]);

   useEffect(() => {
      setErrors(undefined);
   }, [state]);

   async function create() {
      setCreating(true);
      setErrors(undefined);
      setCreationError(undefined);

      let imageUrl = '';

      try {
         const file = values.image;
         if (file && typeof file !== 'string') {
            imageUrl = (await uploadFile(file)).data;
         }
      } catch (error) {
         setCreationError('Ocurrió un error subiendo la imagen.');
         setCreating(false);
         return;
      }

      try {
         await getClinicBySlug(values.slug);
         setCreationError('El nombre de clínica ingresado no está disponible.');

         setCreating(false);
         return;
      } catch (error) {}

      try {
         await createClinicFullFilled({
            clinicData: {
               country: Number(values.country),
               identification: values.document,
               identification_id: Number(values.documentType),
               name: values.name,
               slug: values.slug,
               web_page: values.webPage,
               active: values.active,
               profile_picture_url: imageUrl,
               paypal_id: values.paypal_id,
               paypal_secret_key: values.paypal_secret_key,
            },
            userData: {
               address: '',
               email: values.administrator.email,
               enabled: true,
               last_names: values.administrator.lastNames,
               names: values.administrator.names,
               phone: values.administrator.phone,
               profile_picture: '',
               role: 'ADMINISTRATOR',
               date_created: new Date(),
            },
            headquarters: values.headquarters.map(
               ({ address, city, index, name, phoneNumber, removed }) => ({
                  address,
                  city: Number(city),
                  index,
                  name,
                  phone: phoneNumber,
                  removed,
               }),
            ),
         });

         setIsOpen(true);
      } catch (error) {
         if ((error as AxiosError).response?.status === 409) {
            setCreationError(
               'El email del administrador ingresado ya está en uso.',
            );
         } else {
            setCreationError('Ocurrió un error inesperado.');
         }
      }

      setCreating(false);
   }

   const steps = [
      { name: 'Datos de clínica', state: ClinicCreationState.clinic },
      {
         name: 'Agregar administrador',
         state: ClinicCreationState.administrator,
      },
      { name: 'Resumen', state: ClinicCreationState.preview },
   ];

   return (
      <>
         <SuccessModal isOpen={isOpen} slug={values.slug} />
         <div className="grid h-max min-h-full grid-rows-[auto_auto_1fr_auto]">
            <CreationState
               steps={steps}
               className="w-3/5 grid-cols-[auto_1fr_auto_1fr_auto]"
               state={state}
            />
            {state === ClinicCreationState.clinic ? (
               <ClinicForm
                  errors={errors}
                  cities={cities}
                  countries={countries}
                  id_type={identification_types.filter(
                     type =>
                        type.parent_catalog_id.toString() === values.country,
                  )}
                  valuesState={valuesState}
               />
            ) : state === ClinicCreationState.administrator ? (
               <AdministratorForm errors={errors} valuesState={valuesState} />
            ) : (
               <ClinicPreview valuesState={valuesState} />
            )}
            <div />
            <div className="my-5 flex flex-wrap justify-between gap-y-4">
               {creationError && (
                  <div className="w-full flex-none text-end text-error">
                     {creationError}
                  </div>
               )}
               <Button
                  isDisabled={creating}
                  onPress={() => {
                     if (creating) return;
                     switch (state) {
                        case ClinicCreationState.clinic:
                           router.push(SORoutes.management_clinics);
                           break;
                        case ClinicCreationState.administrator:
                           setState(ClinicCreationState.clinic);
                           break;
                        default:
                           setState(ClinicCreationState.administrator);
                           break;
                     }
                  }}
                  className="flex w-max items-center gap-2 bg-transparent !text-black"
               >
                  <ArrowBackRoundedIcon />
                  {state === ClinicCreationState.clinic
                     ? 'Regreso a Administrar Clínicas'
                     : 'Anterior'}
               </Button>
               <Button
                  isDisabled={creating}
                  onPress={() => {
                     if (creating) return;
                     switch (state) {
                        case ClinicCreationState.clinic:
                           const valuesParsing = valuesSchema.safeParse(values);

                           valuesParsing.success
                              ? setState(ClinicCreationState.administrator)
                              : setErrors(valuesParsing.error.errors);
                           break;
                        case ClinicCreationState.administrator:
                           const administratorParsing =
                              administratorSchema.safeParse(
                                 values.administrator,
                              );

                           administratorParsing.success
                              ? setState(ClinicCreationState.preview)
                              : setErrors(administratorParsing.error.errors);
                           break;
                        default:
                           create();
                           break;
                     }
                  }}
                  className="flex w-max items-center gap-2 !px-20"
               >
                  {creating ? (
                     <>
                        Cargando...
                        <RefreshRoundedIcon className="animate-spin" />
                     </>
                  ) : (
                     <>
                        Continuar
                        <ArrowForwardRoundedIcon />
                     </>
                  )}
               </Button>
            </div>
         </div>
      </>
   );
}

function SuccessModal({ slug, isOpen }: { slug: string; isOpen: boolean }) {
   const router = useRouter();

   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="flex  flex-col items-center gap-9 rounded-xl p-8 sm:p-14">
               <CheckCircleRoundedIcon className="!text-8xl text-primary" />
               <div>
                  <h3 className="mb-3 text-center text-xl">
                     ¡Haz creado una nueva clínica!
                  </h3>
                  <p className="text-center  !font-normal text-on-background-text body-1">
                     Podrás ver la nueva clínica en la sección Administrar
                     Clínicas
                  </p>
               </div>
               <div className="flex gap-4">
                  <Button
                     href={SORoutes.management_clinics}
                     variant={Variant.secondary}
                     className="w-max"
                  >
                     Volver a Administrar Clínicas
                  </Button>
                  <Button
                     href={SORoutes.management_clinic_slug(slug).details}
                     className="w-max"
                  >
                     Abrir Detalles de Clínica
                  </Button>
               </div>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
