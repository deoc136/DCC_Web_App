'use client';

import Button, { Variant } from '@/components/shared/Button';
import PasswordFormModal from '@/components/shared/modals/PasswordFormModal';
import { User } from '@/types/user';
import Image from 'next/image';
import { useState } from 'react';
import CreateIcon from '@mui/icons-material/Create';
import { useRouter } from 'next/navigation';
import { ZodError, z } from 'zod';
import { maxLengthError, nonEmptyMessage } from '@/lib/validations';
import {
   onlyLettersRegex,
   onlyNumbersRegex,
} from '@/lib/regex';
import TextField from '@/components/inputs/TextField';
import { editUser } from '@/services/user';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CancelConfirmationModal from '@/components/shared/modals/CancelConfirmationModal';
import { clinicRoutes } from '@/lib/routes';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Dialog from '@/components/modal/Dialog';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CircleRoundedIcon from '@mui/icons-material/Circle';
import CircleOutlinedRoundedIcon from '@mui/icons-material/CircleOutlined';

interface IProfileSettingsEdit {
   user: User;
   slug: string;
}

export default function ProfileSettingsEdit({
   user,
   slug,
}: IProfileSettingsEdit) {
   const router = useRouter();

   const [openChangePassword, setOpenChangePassword] = useState(false);

   const [values, setValues] = useState(user);

   const [isLoading, setIsLoading] = useState(false);

   const [errors, setErrors] = useState<ZodError['errors']>();
   const [editionError, setEditionError] = useState<string>();

   const [closingOpen, setClosingOpen] = useState(false);
   const [editedOpen, setEditedOpen] = useState(false);

   const valuesSchema = z.object({
      names: z
         .string()
         .nonempty(nonEmptyMessage)
         .max(70, maxLengthError(70))
         .regex(
            onlyLettersRegex,
            'El nombre solo puede contener letras y espacios.',
         ),

      last_names: z
         .string()
         .nonempty(nonEmptyMessage)
         .max(70, maxLengthError(70))
         .regex(
            onlyLettersRegex,
            'Los apellidos solo puede contener letras y espacios.',
         ),
      address: z
         .string()
         .nonempty(nonEmptyMessage)
         .max(200, maxLengthError(200)),

      email: z
         .string()
         .nonempty(nonEmptyMessage)
         .email('El email debe tener un formato correcto.'),

      phone: z
         .string()
         .nonempty(nonEmptyMessage)
         .max(20, maxLengthError(20))
         .regex(
            onlyNumbersRegex,
            'El teléfono solo puede contener números y espacios.',
         ),
   });

   async function edit() {
      setErrors(undefined);
      setEditionError(undefined);

      const valuesParsing = valuesSchema.safeParse(values);

      try {
         if (valuesParsing.success) {
            setIsLoading(true);

            await editUser(values, slug);

            router.refresh();

            setEditedOpen(true);
         } else {
            setErrors(valuesParsing.error.errors);
         }
      } catch (error) {
         setEditionError('Ocurrió un error inesperado.');
      }

      setIsLoading(false);
   }
   return (
      <>
         <SuccessModal isOpen={editedOpen} slug={slug} />
         <CancelConfirmationModal
            isOpen={closingOpen}
            setIsOpen={setClosingOpen}
            route={clinicRoutes(slug).admin_settings_profile}
         />
         <PasswordFormModal
            isOpen={openChangePassword}
            setIsOpen={setOpenChangePassword}
         />
         <div className="my-12 grid grid-cols-[1fr_3fr] gap-14">
            <div className="mx-10 flex flex-col items-center">
               <div className="relative mb-10 aspect-square w-full">
                  <Image
                     src={
                        user.profile_picture.length
                           ? user.profile_picture
                           : '/default_profile_picture.svg'
                     }
                     className="rounded-full object-cover object-center"
                     alt="user image"
                     fill
                  />
               </div>
               <TextField
                  className="mb-2"
                  value={values.names}
                  placeholder="Nombres"
                  errorMessage={
                     errors?.find(error => error.path[0] === 'names')?.message
                  }
                  isDisabled={isLoading}
                  onChange={names => {
                     if (onlyLettersRegex.test(names) || names === '') {
                        setValues(prev => ({ ...prev, names }));
                     }
                  }}
               />
               <TextField
                  className="mb-2"
                  value={values.last_names}
                  placeholder="Apellidos"
                  errorMessage={
                     errors?.find(error => error.path[0] === 'last_names')
                        ?.message
                  }
                  isDisabled={isLoading}
                  onChange={last_names => {
                     if (
                        onlyLettersRegex.test(last_names) ||
                        last_names === ''
                     ) {
                        setValues(prev => ({ ...prev, last_names }));
                     }
                  }}
               />
               <h3 className="my-3 text-base text-on-background-text">
                  Administrador
               </h3>
               <div className="flex items-center gap-2">
                  {user.enabled ? (
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
            <div className="grid h-max gap-10">
               <div className="flex items-center justify-between">
                  <h3 className="text-xl">Información general</h3>
                  <div className="flex flex-wrap justify-end gap-5 justify-self-end">
                     <Button
                        className="h-min w-max !px-12"
                        variant={Variant.secondary}
                        isDisabled={isLoading}
                        onPress={() => setClosingOpen(true)}
                     >
                        Cancelar
                     </Button>
                     <Button
                        isDisabled={isLoading}
                        onPress={() => {
                           const administratorParsing =
                              valuesSchema.safeParse(values);

                           !administratorParsing.success
                              ? setErrors(administratorParsing.error.errors)
                              : edit();
                        }}
                        className="h-min w-max !px-12"
                     >
                        {isLoading ? (
                           <>
                              Cargando...
                              <RefreshRoundedIcon className="animate-spin" />
                           </>
                        ) : (
                           'Guardar'
                        )}
                     </Button>
                     {editionError && (
                        <div className="w-full flex-none text-end text-error">
                           {editionError}
                        </div>
                     )}
                  </div>
               </div>
               <section className="grid grid-cols-2 gap-10">
                  <TextField
                     value={values.phone}
                     placeholder="Ingresar número"
                     label="Teléfono"
                     errorMessage={
                        errors?.find(error => error.path[0] === 'phone')
                           ?.message
                     }
                     isDisabled={isLoading}
                     onChange={phone => {
                        if (onlyNumbersRegex.test(phone) || phone === '') {
                           setValues(prev => ({ ...prev, phone }));
                        }
                     }}
                  />
                  <TextField
                     value={values.email}
                     isDisabled
                     label="Correo electrónico"
                  />
                  <div className="col-span-2">
                     <TextField
                        value={values.address}
                        placeholder="Dirección"
                        label="Ingresar dirección"
                        errorMessage={
                           errors?.find(error => error.path[0] === 'address')
                              ?.message
                        }
                        isDisabled={isLoading}
                        onChange={address => {
                           setValues(prev => ({ ...prev, address }));
                        }}
                     />
                  </div>
               </section>
               <h3 className="text-xl">Ingreso y seguridad</h3>
               <div className="grid grid-cols-[2fr_1fr] items-center">
                  <h3 className="text-lg font-semibold">
                     Contraseña de ingreso
                  </h3>
                  <Button
                     variant={Variant.secondary}
                     onPress={() => setOpenChangePassword(true)}
                     className="ml-auto flex items-center justify-center gap-2"
                  >
                     <CreateIcon />
                     Cambiar contraseña
                  </Button>
               </div>
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
                  href={clinicRoutes(slug).admin_settings_profile}
               >
                  Entiendo
               </Button>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
