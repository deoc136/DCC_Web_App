'use client';

import { useEffect, useState } from 'react';
import CreationState from '@/components/shared/CreationState';
import Button, { Variant } from '@/components/shared/Button';
import { useRouter } from 'next/navigation';
import { clinicRoutes } from '@/lib/routes';
import ServiceForm from '../../views/ServiceForm';
import { NewService } from '@/types/service';
import { ZodError, z } from 'zod';
import { maxLengthError, nonEmptyMessage } from '@/lib/validations';
import { onlyLettersRegex, onlyNumbersRegex } from '@/lib/regex';
import ServicePreview from './ServicePreview';
import { createService, getAllServices } from '@/services/service';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Dialog from '@/components/modal/Dialog';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { useAppDispatch } from '@/lib/hooks/redux-hooks';
import { changeTitle } from '@/lib/features/title/title_slice';
import NewPackageModal from '../../components/NewPackageModal';
import EditPackageModal from '../../components/EditPackageModal';
import { ServiceCreationState } from '../utils';
import { createPackage } from '@/services/package';
import DeletingModal from '@/components/shared/modals/DeletingModal';
import { uploadFile } from '@/services/files';

interface ICreationView {
   slug: string;
}

export interface ServiceType extends NewService {
   image?: string | undefined | File;
}

const serviceInitialState: ServiceType = {
   name: '',
   price: '',
   active: true,
   description: '',
   has_pause: false,
   service_duration: '0',
   pause_duration: '0',
};

export default function CreationView({ slug }: ICreationView) {
   const router = useRouter();

   const [state, setState] = useState(ServiceCreationState.creating);
   const [creating, setCreating] = useState(false);
   const [creationError, setCreationError] = useState<string>();

   const [serviceId, setServiceId] = useState<number>();
   const [warningOpen, setWarningOpen] = useState(false);

   const [creatingPackage, setCreatingPackage] = useState(false);
   const [editingPackage, setEditingPackage] = useState<number>();
   const [deletingPackage, setDeletingPackage] = useState<number>();

   const [packages, setPackages] = useState(Array<Package>());

   const dispatch = useAppDispatch();

   const [values, setValues] = useState(serviceInitialState);

   const [errors, setErrors] = useState<ZodError['errors']>();

   async function create() {
      if (creating) return;

      setCreating(true);

      let picture_url = undefined;

      try {
         const file = values.image;
         if (file && typeof file !== 'string') {
            picture_url = (await uploadFile(file)).data;
         }
      } catch (error) {
         setCreationError('Ocurrió un error subiendo la imagen.');
         setCreating(false);
         return;
      }

      try {
         const aux = { ...values, image: undefined };
         await createService({ ...aux, picture_url }, slug);

         const { id } = (await getAllServices(slug)).data.findLast(
            service => service.name,
         )!;

         await Promise.all(
            packages.map($package =>
               createPackage(slug, { ...$package, service_id: id }),
            ),
         );

         setServiceId(id);
      } catch (error) {
         setCreationError('Ocurrió un error inesperado.');
      }

      setCreating(false);
   }

   const valuesSchema = z.object({
      name: z
         .string()
         .nonempty(nonEmptyMessage)
         .max(70, maxLengthError(70))
         .regex(
            onlyLettersRegex,
            'El nombre solo puede contener letras y espacios.',
         ),
      price: z
         .string()
         .nonempty(nonEmptyMessage)
         .regex(
            onlyNumbersRegex,
            'El precio solo puede contener números y puntos.',
         ),
      service_duration: z
         .number()
         .min(60, 'La duración debe ser mayor a un minuto.'),

      pause_duration: z
         .number()
         .min(
            values.has_pause ? 60 : 0,
            'La duración debe ser mayor a un minuto.',
         ),
      description: z
         .string()
         .nonempty(nonEmptyMessage)
         .max(500, maxLengthError(500)),
   });

   function changeValue<T extends keyof typeof values>(
      param: T,
      value: (typeof values)[T],
   ) {
      setValues(prev => ({ ...prev, [param]: value }));
   }

   const steps = [
      { name: 'Datos del servicio', state: ServiceCreationState.creating },
      { name: 'Resumen', state: ServiceCreationState.preview },
   ];

   function deletePackage() {
      if (deletingPackage === undefined) return;

      setPackages(prev => {
         const aux = [...prev];
         aux.splice(deletingPackage, 1);

         return aux;
      });
   }

   useEffect(() => {
      dispatch(
         changeTitle({
            goBackRoute: clinicRoutes(slug).admin_services,
            value: 'Servicios / Crear servicio',
         }),
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   useEffect(() => {
      setErrors(undefined);
   }, [state]);

   useEffect(() => {
      setWarningOpen(deletingPackage !== undefined);
   }, [deletingPackage]);

   return (
      <>
         {editingPackage !== undefined && (
            <EditPackageModal
               setPackages={setPackages}
               servicePackage={packages[editingPackage]}
               isOpen
               setEditingPackage={setEditingPackage}
               editingPackage={editingPackage}
            />
         )}

         <DeletingModal
            action={() => {
               deletePackage();
               setDeletingPackage(undefined);
            }}
            dismiss={() => {
               setDeletingPackage(undefined);
            }}
            isDeleting={false}
            isOpen={warningOpen}
         >
            <div>
               <h3 className="mb-3 text-center text-xl">
                  ¿Deseas eliminar el paquete?
               </h3>
               <p className="text-center !font-normal text-on-background-text body-1">
                  Una vez eliminado no podrás recuperar la información que hayas{' '}
                  <br /> ingresado sobre el paquete
               </p>
            </div>
         </DeletingModal>
         <NewPackageModal
            isOpen={creatingPackage}
            setIsOpen={setCreatingPackage}
            setPackages={setPackages}
         />
         <SuccessModal
            isOpen={serviceId !== undefined}
            id={serviceId}
            slug={slug}
         />
         <div className="grid h-max min-h-full grid-rows-[auto_auto_1fr_auto]">
            <CreationState
               className="w-1/3 grid-cols-[auto_1fr_auto]"
               steps={steps}
               state={state}
            />
            {state === ServiceCreationState.creating ? (
               <ServiceForm
                  changeValue={changeValue}
                  errors={errors}
                  values={values}
                  packages={packages}
                  setCreatingPackage={setCreatingPackage}
                  setEditingPackage={setEditingPackage}
                  setDeletingPackage={setDeletingPackage}
               />
            ) : (
               <ServicePreview
                  values={values}
                  packages={packages}
                  setCreatingPackage={setCreatingPackage}
                  setEditingPackage={setEditingPackage}
                  setDeletingPackage={setDeletingPackage}
               />
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
                        case ServiceCreationState.creating:
                           router.push(clinicRoutes(slug).admin_services);
                           break;
                        default:
                           setState(ServiceCreationState.creating);
                           break;
                     }
                  }}
                  className="flex w-max items-center gap-2 bg-transparent !text-black"
               >
                  <ArrowBackRoundedIcon />
                  {state === ServiceCreationState.creating
                     ? 'Regresar a Servicios'
                     : 'Anterior'}
               </Button>
               <Button
                  isDisabled={creating}
                  onPress={() => {
                     setErrors(undefined);
                     if (creating) return;
                     switch (state) {
                        case ServiceCreationState.creating:
                           const valuesParsing = valuesSchema.safeParse({
                              ...values,
                              service_duration: Number(values.service_duration),
                              pause_duration: Number(values.pause_duration),
                           });
                           valuesParsing.success
                              ? setState(ServiceCreationState.preview)
                              : setErrors(valuesParsing.error.errors);
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

function SuccessModal({
   slug,
   isOpen,
   id,
}: {
   slug: string;
   isOpen: boolean;
   id?: number;
}) {
   const router = useRouter();

   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="flex  flex-col items-center gap-9 rounded-xl p-8 sm:p-14">
               <CheckCircleRoundedIcon className="!text-8xl text-primary" />
               <div>
                  <h3 className="mb-3 text-center text-xl">
                     Servicio creado exitosamente
                  </h3>
                  <p className="text-center  !font-normal text-on-background-text body-1">
                     Un nuevo servicio ha sido añadido a tu lista de servicios
                  </p>
               </div>
               <Button
                  onPress={() => {
                     if (!id) return;
                     router.push(
                        clinicRoutes(slug).admin_services_id(id).details,
                     );
                     router.refresh();
                  }}
                  className="!w-max !px-24"
               >
                  Continuar
               </Button>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
