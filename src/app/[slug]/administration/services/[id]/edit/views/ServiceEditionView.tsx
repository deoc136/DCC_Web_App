'use client';

import { Service } from '@/types/service';
import { useRouter } from 'next/navigation';
import {
   ChangeEvent,
   Dispatch,
   SetStateAction,
   useEffect,
   useRef,
   useState,
} from 'react';
import { useAppDispatch } from '@/lib/hooks/redux-hooks';
import { editService } from '@/services/service';
import {
   createPackage,
   deletePackage as deletePackageApi,
   editPackage,
} from '@/services/package';
import { ZodError, z } from 'zod';
import { maxLengthError, nonEmptyMessage } from '@/lib/validations';
import { onlyLettersRegex, onlyNumbersRegex } from '@/lib/regex';
import { changeTitle } from '@/lib/features/title/title_slice';
import { GlobalRoute, clinicRoutes } from '@/lib/routes';
import EditPackageModal from '../../../components/EditPackageModal';
import NewPackageModal from '../../../components/NewPackageModal';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Dialog from '@/components/modal/Dialog';
import Button, { Variant } from '@/components/shared/Button';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import TextField from '@/components/inputs/TextField';
import { TimeField } from '@/components/inputs/TimeField';
import { Time } from '@internationalized/date';
import Checkbox from '@/components/shared/Checkbox';
import ServicePackage from '@/components/shared/ServicePackage';
import { AddRounded } from '@mui/icons-material';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import DeletingModal from '@/components/shared/modals/DeletingModal';
import useClinicCurrency from '@/lib/hooks/useClinicCurrency';
import InputImage from '@/components/inputs/InputImage';
import { uploadFile } from '@/services/files';

interface IServiceEditionView {
   service: Service;
   initialPackages: Package[];
   slug: string;
}

export default function ServiceEditionView({
   initialPackages,
   service,
   slug,
}: IServiceEditionView) {
   const [editedSuccessfully, setEditedSuccessfully] = useState(false);

   const clinicCurrency = useClinicCurrency();

   const [editing, setEditing] = useState(false);
   const [editionError, setEditionError] = useState<string>();

   const [warningOpen, setWarningOpen] = useState(false);
   const [savingOpen, setSavingOpen] = useState(false);
   const [closingOpen, setClosingOpen] = useState(false);

   const [creatingPackage, setCreatingPackage] = useState(false);
   const [editingPackage, setEditingPackage] = useState<number>();
   const [deletingPackage, setDeletingPackage] = useState<number>();

   const [newImage, setNewImage] = useState<File | string>();

   const [packages, setPackages] = useState(initialPackages);

   const dispatch = useAppDispatch();

   const [values, setValues] = useState(service);

   const inputFileRef = useRef<HTMLInputElement>(null);

   async function edit() {
      if (editing) return;

      setEditing(true);
      setEditionError(undefined);

      try {
         let picture_url = values.picture_url;

         if (newImage) {
            try {
               if (newImage && typeof newImage !== 'string') {
                  picture_url = (await uploadFile(newImage)).data;
               }
            } catch (error) {
               throw Error('Ocurrió un error subiendo la imagen.');
            }
         }

         await editService({ ...values, picture_url }, slug);

         await Promise.all([
            ...packages.map($package =>
               $package.id === -1
                  ? createPackage(slug, {
                       ...$package,
                       id: undefined,
                       service_id: values.id,
                    } as any)
                  : editPackage(slug, $package),
            ),

            ...initialPackages
               .filter(ip => !packages.some($package => $package.id === ip.id))
               .map($package => deletePackageApi(slug, $package.id.toString())),
         ]);

         setSavingOpen(false);
         setEditedSuccessfully(true);
      } catch (error) {
         setEditionError('Ocurrió un error inesperado.');
      }

      setEditing(false);
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

   const [errors, setErrors] = useState<ZodError['errors']>();

   function changeValue<T extends keyof typeof values>(
      param: T,
      value: (typeof values)[T],
   ) {
      setValues(prev => ({ ...prev, [param]: value }));
   }

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
            value: 'Servicios / Editar servicio',
         }),
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   useEffect(() => {
      setWarningOpen(deletingPackage !== undefined);
   }, [deletingPackage]);

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

   return (
      <>
         <CancelConfirmationModal
            isOpen={closingOpen}
            route={clinicRoutes(slug).admin_services_id(service.id).details}
            setIsOpen={setClosingOpen}
         />
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
         <WishSaveModal
            action={edit}
            editing={editing}
            isOpen={savingOpen}
            setIsOpen={setSavingOpen}
            editionError={editionError}
         />
         <NewPackageModal
            isOpen={creatingPackage}
            setIsOpen={setCreatingPackage}
            setPackages={setPackages}
         />
         <SuccessModal
            isOpen={editedSuccessfully}
            id={service.id}
            slug={slug}
         />
         <div>
            <div className="grid grid-cols-2 gap-5">
               <TextField
                  placeholder="Ingresar nombre"
                  value={values.name}
                  errorMessage={
                     errors?.find(error => error.path.at(0) === 'name')?.message
                  }
                  onChange={val => {
                     if (onlyLettersRegex.test(val) || val === '') {
                        changeValue('name', val);
                     }
                  }}
               />
               <div className="flex gap-5 justify-self-end">
                  <Button
                     variant={Variant.secondary}
                     onPress={() => {
                        if (editing) return;
                        setClosingOpen(true);
                     }}
                     className="!h-min !px-16"
                  >
                     Cancelar
                  </Button>
                  <Button
                     onPress={() => {
                        setErrors(undefined);
                        const valuesParsing = valuesSchema.safeParse({
                           ...values,
                           service_duration: Number(values.service_duration),
                           pause_duration: Number(values.pause_duration),
                        });
                        valuesParsing.success
                           ? setSavingOpen(true)
                           : setErrors(valuesParsing.error.errors);
                     }}
                     className="flex !h-min gap-2 !px-16"
                  >
                     Guardar
                  </Button>
               </div>
            </div>

            <section className="mx-20 my-10 grid grid-cols-[1fr_2fr] gap-5">
               <InputImage
                  inputFileRef={inputFileRef}
                  imageInputHandler={imageInputHandler}
                  file={newImage}
                  clearFile={() => setNewImage(undefined)}
                  defaultImageUrl={
                     service.picture_url?.length
                        ? service.picture_url
                        : '/default_service_image.png'
                  }
               >
                  <p className="font-semibold text-on-background-text">
                     Cambiar imagen
                  </p>
               </InputImage>
               <div className="grid h-min grid-cols-2 gap-5">
                  <TextField
                     label="Precio de la sesión"
                     endIcon={<div>{clinicCurrency}</div>}
                     placeholder="Ingresar precio"
                     value={values.price}
                     errorMessage={
                        errors?.find(error => error.path.at(0) === 'price')
                           ?.message
                     }
                     onChange={val => {
                        if (onlyNumbersRegex.test(val) || val === '') {
                           changeValue('price', val);
                        }
                     }}
                  />
                  <TimeField
                     hourCycle={24}
                     label="Duración del servicio"
                     granularity="second"
                     value={new Time(0, 0, 0).add({
                        seconds: Number(values.service_duration),
                     })}
                     errorMessage={
                        errors?.find(
                           error => error.path.at(0) === 'service_duration',
                        )?.message
                     }
                     onChange={val => {
                        changeValue(
                           'service_duration',
                           (
                              val.second +
                              val.minute * 60 +
                              val.hour * 3600
                           ).toString(),
                        );
                     }}
                  />
                  <div>
                     <Checkbox
                        className="mb-2"
                        isSelected={values.has_pause}
                        onChange={val => {
                           if (!val) {
                              changeValue('pause_duration', '0');
                           }
                           changeValue('has_pause', val);
                        }}
                     >
                        Agregar tiempo entre sesiones
                     </Checkbox>
                     <TimeField
                        granularity="second"
                        hourCycle={24}
                        isDisabled={!values.has_pause}
                        value={new Time(0, 0, 0).add({
                           seconds: Number(values.pause_duration ?? '0'),
                        })}
                        errorMessage={
                           errors?.find(
                              error => error.path.at(0) === 'pause_duration',
                           )?.message
                        }
                        onChange={val => {
                           changeValue(
                              'pause_duration',
                              (
                                 val.second +
                                 val.minute * 60 +
                                 val.hour * 3600
                              ).toString(),
                           );
                        }}
                     />
                  </div>
               </div>
               <div className="col-span-full">
                  <TextField
                     rows={9}
                     isTextArea
                     label="Descripción del servicio"
                     placeholder="Ingresar descripción"
                     value={values.description}
                     errorMessage={
                        errors?.find(
                           error => error.path.at(0) === 'description',
                        )?.message
                     }
                     onChange={val => changeValue('description', val)}
                  />
               </div>
            </section>
            <div className="flex justify-between">
               <h2 className="font-semibold">Paquetes de servicio</h2>
               <Button
                  className="flex !w-max items-center gap-2"
                  variant={Variant.secondary}
                  onPress={() => setCreatingPackage(true)}
               >
                  <AddRounded />
                  Crear paquete
               </Button>
            </div>
            <section
               className={`mx-20 my-10 grid gap-5 ${
                  packages.length > 1 && 'grid-cols-2'
               }`}
            >
               {packages.length > 0 ? (
                  packages.map(($package, i) => (
                     <ServicePackage
                        key={i}
                        index={i}
                        setEditingPackage={setEditingPackage}
                        setDeletingPackage={setDeletingPackage}
                        servicePackage={$package}
                     />
                  ))
               ) : (
                  <p className="col-span-2 my-10 w-full text-center font-semibold">
                     No has creado ningún paquete
                  </p>
               )}
            </section>
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
                     Servicio editado exitosamente
                  </h3>
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

function WishSaveModal({
   isOpen,
   setIsOpen,
   editing,
   action,
   editionError,
}: {
   isOpen: boolean;
   setIsOpen: Dispatch<SetStateAction<boolean>>;
   editing: boolean;
   action: () => any;
   editionError: string | undefined;
}) {
   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="flex flex-col items-center gap-9 rounded-xl p-8 sm:p-14">
               <InfoRoundedIcon className="!text-8xl text-primary" />
               <div>
                  <h3 className="mb-3 text-center text-xl">
                     ¿Deseas guardar los cambios?
                  </h3>
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <Button
                     variant={Variant.secondary}
                     isDisabled={editing}
                     onPress={() => {
                        if (editing) return;

                        setIsOpen(false);
                     }}
                     className="!w-max !px-24"
                  >
                     Cancelar
                  </Button>
                  <Button
                     isDisabled={editing}
                     onPress={async () => {
                        if (editing) return;

                        action();
                     }}
                     className="!w-max !px-24"
                  >
                     {editing ? (
                        <>
                           Cargando...
                           <RefreshRoundedIcon className="animate-spin" />
                        </>
                     ) : (
                        <>Guardar</>
                     )}
                  </Button>
                  {editionError && (
                     <div className="col-span-2 w-full text-center text-error">
                        {editionError}
                     </div>
                  )}
               </div>
            </Dialog>
         )}
      </ModalTrigger>
   );
}

function CancelConfirmationModal({
   isOpen,
   route,
   setIsOpen,
}: {
   isOpen: boolean;
   setIsOpen: Dispatch<SetStateAction<boolean>>;
   route: GlobalRoute;
}) {
   const router = useRouter();

   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="flex flex-col items-center gap-9 rounded-xl p-8 sm:p-14">
               <WarningRoundedIcon className="!text-8xl !text-warning" />
               <div>
                  <h3 className="mb-3 text-center text-xl">
                     ¿Estás seguro de cancelar el proceso?
                  </h3>
                  <p className="text-center !font-normal text-on-background-text body-1">
                     Tus cambios no serán guardados
                  </p>
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <Button
                     variant={Variant.secondary}
                     onPress={() => {
                        setIsOpen(false);
                     }}
                     className="!px-24"
                  >
                     Atrás
                  </Button>
                  <Button href={route} className="!px-24">
                     Cancelar
                  </Button>
               </div>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
