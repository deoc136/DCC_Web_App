'use client';

import TextField from '@/components/inputs/TextField';
import Dialog from '@/components/modal/Dialog';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Button, { Variant } from '@/components/shared/Button';
import { password_regex } from '@/lib/utils';
import { nonEmptyMessage } from '@/lib/validations';
import { ZodError, z, ZodIssue, string } from 'zod';
import { passwordInitialValues as passwordInitialValues } from '../../../app/software-owner/management/settings/values';
import { Dispatch, SetStateAction, useState } from 'react';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SuccessModal from '../../../app/software-owner/management/settings/components/SuccessModal';
import { Auth } from 'aws-amplify';
import { translateError } from '@/lib/amplify_aux/error_messages';
import { IAmplifyError } from '@/types/amplify';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import useDictionary from '@/lib/hooks/useDictionary';

interface IPasswordFormModal {
   isOpen: boolean;
   setIsOpen: Dispatch<SetStateAction<boolean>>;
   action?: () => any;
}

const Message_description =
   'La contraseña debe tener al menos una letra mayúscula, una minúscula, un numero y un caracter especial.';
const Message_min = 'La contraseña debe contener mínimo 8 caracteres';

export default function PasswordFormModal({
   isOpen,
   setIsOpen,
}: IPasswordFormModal) {
   const dic = useDictionary();

   const valueState = useState(passwordInitialValues);
   const [values, setValues] = valueState;
   const [errors, setErrors] = useState<ZodError['errors']>();

   const [isChanged, setIsChanged] = useState(false);

   const passwordSchema = z.object({
      oldPassword: z.string().nonempty(nonEmptyMessage),
      newPassword: z
         .string()
         .nonempty(nonEmptyMessage)
         .min(8, Message_min)
         .regex(password_regex, Message_description),
      confirmPassword: z
         .string()
         .nonempty(nonEmptyMessage)
         .min(8, Message_min)
         .regex(password_regex, Message_description),
   });

   function changeValue(
      param: keyof typeof values,
      value: (typeof values)[typeof param],
   ) {
      setValues(prev => ({ ...prev, [param]: value }));
   }

   async function changePassword() {
      if (changing) return;

      setErrors(undefined);

      const formData = passwordSchema.safeParse(values);

      if (!formData.success) {
         return setErrors(formData.error.errors);
      }
      const { oldPassword, newPassword } = values;

      setChanging(true);

      try {
         const user = await Auth.currentAuthenticatedUser();

         await Auth.changePassword(user, oldPassword, newPassword);

         setErrors(undefined);
         setValues(passwordInitialValues);
         setIsChanged(true);
         setIsOpen(false);
      } catch (error) {
         setErrors([
            {
               code: 'custom',
               path: ['oldPassword'],
               message: translateError(error as IAmplifyError),
            },
         ]);
      }

      setChanging(false);
   }

   const [changing, setChanging] = useState(false);

   return (
      <>
         <ModalTrigger
            className="m-2 w-full animate-appear sm:m-8 sm:w-2/3 lg:w-5/12"
            isOpen={isOpen}
         >
            {() => (
               <Dialog className="flex w-full flex-col items-center gap-14 rounded-xl p-4 sm:p-8">
                  <div className="w-full">
                     <div className="mb-14 flex items-center">
                        <h3 className="mb-3 mt-2 text-xl">
                           {dic.texts.flows.change_password}
                        </h3>
                        <Button
                           className="ml-auto !w-max bg-transparent !p-0"
                           onPress={() => {
                              setErrors(undefined);
                              setValues(passwordInitialValues);
                              setIsOpen(false);
                           }}
                        >
                           <CloseRoundedIcon className="!fill-black" />
                        </Button>
                     </div>
                     <div className="ml-auto grid gap-5">
                        <TextField
                           label={dic.texts.users.old_password}
                           placeholder={dic.inputs.enter_password}
                           type="password"
                           value={values.oldPassword}
                           errorMessage={
                              errors?.find(
                                 error => error.path[0] === 'oldPassword',
                              )?.message
                           }
                           onChange={val => {
                              changeValue('oldPassword', val);
                           }}
                        />
                        <TextField
                           label={dic.texts.users.new_password}
                           placeholder={dic.inputs.enter_password}
                           type="password"
                           value={values.newPassword}
                           onChange={val => {
                              changeValue('newPassword', val);
                           }}
                        />
                        <TextField
                           label={dic.texts.users.confirm_new_password}
                           placeholder={dic.inputs.enter_password}
                           type="password"
                           value={values.confirmPassword}
                           errorMessage={
                              errors?.find(
                                 error => error.path[0] === 'confirmPassword',
                              )?.message
                           }
                           onChange={val => {
                              changeValue('confirmPassword', val);
                           }}
                        />
                     </div>
                  </div>
                  <div className="flex w-full gap-5">
                     <Button
                        variant={Variant.secondary}
                        isDisabled={changing}
                        onPress={() => {
                           setValues(passwordInitialValues);
                           setErrors(undefined);
                           setIsOpen(false);
                        }}
                     >
                        {dic.texts.flows.cancel}
                     </Button>
                     <Button
                        isDisabled={
                           !values.oldPassword ||
                           !values.newPassword ||
                           !values.confirmPassword ||
                           values.confirmPassword != values.newPassword ||
                           changing
                        }
                        onPress={changePassword}
                     >
                        {changing ? (
                           <>
                              {dic.texts.flows.loading}...
                              <RefreshRoundedIcon className="animate-spin" />
                           </>
                        ) : (
                           dic.texts.flows.change
                        )}
                     </Button>
                  </div>
               </Dialog>
            )}
         </ModalTrigger>
         <SuccessModal
            title={dic.texts.flows.password_changed}
            isOpen={isChanged}
            setIsOpen={setIsChanged}
         />
      </>
   );
}
