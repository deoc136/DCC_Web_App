'use client';

import Button, { Variant } from '@/components/shared/Button';
import { changeTitle } from '@/lib/features/title/title_slice';
import { useAppDispatch } from '@/lib/hooks/redux-hooks';
import CreateIcon from '@mui/icons-material/Create';
import SuccessModal from '../components/SuccessModal';
import { useEffect, useState } from 'react';
import PasswordFormModal from '@/components/shared/modals/PasswordFormModal';
import { ZodError, z } from 'zod';
import { maxLengthError, nonEmptyMessage } from '@/lib/validations';
import { onlyLettersRegex } from '@/lib/regex';
import TextField from '@/components/inputs/TextField';
import WarningModal from '../components/WarningModal';
import { SoftwareOwner } from '@/types/software-owner';
import { editSoftwareOwner } from '@/services/software-owner';
import { useRouter } from 'next/navigation';

interface UserInfo {
   email: string;
   name: string;
   middle_name: string;
   family_name: string;
}

interface ISettingsView {
   attributes: SoftwareOwner;
}

export default function SettingsView({ attributes }: ISettingsView) {
   const [values, setValues] = useState(attributes);

   const router = useRouter();

   const [isLoading, setIsLoading] = useState(false);

   const dispatch = useAppDispatch();
   const [isChangedPassword, setIsChangedPassword] = useState(false);
   const [isCancelWarning, setIsCancelWarning] = useState(false);
   const [isChangedEdit, setChangedEdit] = useState(false);

   const [errors, setErrors] = useState<ZodError['errors']>();

   const [isChanged, setIsChanged] = useState(false);

   useEffect(() => {
      dispatch(
         changeTitle({
            goBackRoute: null,
            value: 'Configuración',
         }),
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const adminEditSchema = z.object({
      name: z
         .string()
         .nonempty(nonEmptyMessage)
         .max(70, maxLengthError(70))
         .regex(
            onlyLettersRegex,
            'El nombre solo puede contener letras y espacios.',
         ),

      last_name: z
         .string()
         .nonempty(nonEmptyMessage)
         .max(70, maxLengthError(70))
         .regex(
            onlyLettersRegex,
            'Los apellidos solo puede contener letras y espacios.',
         ),
   });

   function changeValue(
      param: keyof typeof values,
      value: (typeof values)[typeof param],
   ) {
      setValues(prev => ({ ...prev, [param]: value }));
   }

   async function adminEdit() {
      if (isLoading) return;

      const formData = adminEditSchema.safeParse(values);

      if (!formData.success) {
         return setErrors(formData.error.errors);
      }

      setIsLoading(true);

      try {
         await editSoftwareOwner(values);

         setIsChanged(true);
         setErrors(undefined);

         router.refresh();
      } catch (error) {}

      setIsLoading(false);
   }

   const closeWarning = () => {
      setValues(attributes);
      setIsCancelWarning(false);
      setChangedEdit(false);
   };

   const closeSuccess = () => {
      setErrors(undefined);
      setIsChanged(false);
      setChangedEdit(false);
   };

   const closeOnlyWarning = () => {
      setValues(attributes);
      setIsCancelWarning(false);
   };

   return (
      <section>
         <PasswordFormModal
            isOpen={isChangedPassword}
            setIsOpen={setIsChangedPassword}
         />
         <WarningModal
            isOpen={isCancelWarning}
            setIsOpen={closeWarning}
            setCloseWarning={closeOnlyWarning}
         />
         <SuccessModal
            isOpen={isChanged}
            setIsOpen={closeSuccess}
            title="Tus cambios se han guardado"
            subTitle="Podrás ver tus cambios actualizados en configuración"
         />

         <h3 className="mb-10 text-xl">Ingreso y seguridad </h3>
         <div className="mb-5 ml-24 grid grid-cols-[2fr_1fr] items-center">
            <h4 className="text-lg font-semibold">Editar datos personales</h4>
            {!isChangedEdit ? (
               <Button
                  onPress={() => setChangedEdit(true)}
                  variant={Variant.secondary}
                  className="ml-auto flex items-center justify-center gap-2 border-0"
               >
                  <CreateIcon />
                  Cambiar datos de ingreso
               </Button>
            ) : (
               <div className="flex gap-5">
                  <Button
                     onPress={() => {
                        setErrors(undefined);
                        setIsCancelWarning(true);
                     }}
                     variant={Variant.secondary}
                     isDisabled={isLoading}
                  >
                     {isLoading ? 'Cargando...' : 'Cancelar'}
                  </Button>
                  <Button
                     isDisabled={isLoading}
                     variant={Variant.primary}
                     onPress={adminEdit}
                  >
                     {isLoading ? 'Cargando...' : 'Guardar'}
                  </Button>
               </div>
            )}
         </div>
         <div className="ml-24">
            {!isChangedEdit ? (
               <>
                  <div className="grid grid-cols-2 gap-5">
                     <div>
                        <h4 className="font-semibold">Nombres</h4>
                        <p className="mt-1 text-on-background-text">
                           {values.name}
                        </p>
                     </div>
                     <div>
                        <h4 className="font-semibold">Apellidos</h4>
                        <p className="mt-1 text-on-background-text">
                           {values.last_name}
                        </p>
                     </div>
                     <div>
                        <h4 className="font-semibold">Correo electrónico</h4>
                        <p className="mt-1 text-on-background-text">
                           {values.email}
                        </p>
                     </div>
                  </div>
               </>
            ) : (
               <>
                  <div className="grid grid-cols-2 gap-5">
                     <TextField
                        label="Nombres"
                        value={values.name}
                        placeholder="Nombres"
                        errorMessage={
                           errors?.find(error => error.path[0] === 'name')
                              ?.message
                        }
                        isDisabled={isLoading}
                        onChange={val => {
                           if (onlyLettersRegex.test(val) || val === '') {
                              changeValue(
                                 'name',
                                 val
                                    .split(' ')
                                    .map(
                                       word =>
                                          word.charAt(0).toUpperCase() +
                                          word.slice(1).toLowerCase(),
                                    )
                                    .join(' '),
                              );
                           }
                        }}
                     />
                     <TextField
                        label="Apellidos"
                        value={values.last_name}
                        placeholder="Apellidos"
                        errorMessage={
                           errors?.find(error => error.path[0] === 'last_name')
                              ?.message
                        }
                        isDisabled={isLoading}
                        onChange={val => {
                           if (onlyLettersRegex.test(val) || val === '') {
                              changeValue(
                                 'last_name',
                                 val
                                    .split(' ')
                                    .map(
                                       word =>
                                          word.charAt(0).toUpperCase() +
                                          word.slice(1).toLowerCase(),
                                    )
                                    .join(' '),
                              );
                           }
                        }}
                     />
                  </div>
               </>
            )}
            <hr className="my-4" />
            <div className="grid grid-cols-[2fr_1fr] items-center">
               <h3 className="text-lg font-semibold">
                  Cambiar datos de ingreso
               </h3>
               <Button
                  variant={Variant.secondary}
                  onPress={() => setIsChangedPassword(true)}
                  className="ml-auto flex items-center justify-center gap-2"
               >
                  <CreateIcon />
                  Cambiar contraseña
               </Button>
            </div>
         </div>
      </section>
   );
}
