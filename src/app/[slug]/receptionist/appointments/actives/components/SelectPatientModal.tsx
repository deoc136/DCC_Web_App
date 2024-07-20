'use client';

import Dialog from '@/components/modal/Dialog';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Button, { Variant } from '@/components/shared/Button';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Tabs } from '@/components/shared/Tabs';
import { Item } from 'react-stately';
import { NewUser, NewUserOutline, User } from '@/types/user';
import { ZodError, z } from 'zod';
import { maxLengthError, nonEmptyMessage } from '@/lib/validations';
import { onlyLettersRegex, onlyNumbersRegex } from '@/lib/regex';
import CreateUserForm from '@/components/shared/CreateUserForm';
import ExistentUserSelector from '@/components/shared/ExistentUserSelector';

enum Mode {
   existent,
   new,
}

const emptyNewAdmin = {
   names: '',
   email: '',
   last_names: '',
   role: 'PATIENT',
   phone: '',
   address: '',
};

interface ISelectPatientModal {
   isOpen: boolean;
   setIsOpen: Dispatch<SetStateAction<boolean>>;
   selectedUserId: string | null;
   users: User[];
   changeValues: (patientId: string) => any;
   newUser: NewUser | undefined;
   setNewUser: Dispatch<SetStateAction<NewUser | undefined>>;
}

export default function SelectPatientModal({
   isOpen,
   setIsOpen,
   users,
   changeValues,
   selectedUserId,
   newUser,
   setNewUser,
}: ISelectPatientModal) {
   const [mode, setMode] = useState(Mode.new);

   const userSchema = z.object({
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

      last_names: z
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
      address: z
         .string()
         .nonempty(nonEmptyMessage)
         .max(100, maxLengthError(100)),
   });

   const [formErrors, setFormErrors] = useState<ZodError['errors']>();

   const [selectedUser, setSelectedUser] = useState(selectedUserId);

   const [newUserOutline, setNewUserOutline] = useState<
      NewUserOutline | undefined
   >(newUser);

   function save() {
      if (!!newUserOutline) {
         setFormErrors(undefined);
         const parsing = userSchema.safeParse(newUserOutline);

         if (parsing.success) {
            setNewUser({
               ...newUserOutline,
               enabled: true,
               address: newUserOutline.address ?? '',
               profile_picture: '',
               cognito_id: '',
               role: 'PATIENT',
               date_created: new Date(),
            });
         } else {
            setFormErrors(parsing.error.errors);
            return;
         }
      } else {
         setNewUser(undefined);
         selectedUser && changeValues(selectedUser);
      }

      setIsOpen(false);
   }

   useEffect(() => {
      if (mode === Mode.existent) {
         setNewUserOutline(undefined);
         setFormErrors(undefined);
      } else {
         setNewUserOutline(emptyNewAdmin);
      }
   }, [mode]);

   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="flex w-[60vw] max-w-screen-lg flex-col gap-6 rounded-xl p-7">
               <div className="grid grid-cols-[auto_auto_1fr] items-baseline justify-between gap-5">
                  <h2 className="text-2xl font-semibold">Agregar paciente</h2>
                  <ModalTabs mode={mode} setMode={setMode} />
                  <Button
                     className="!w-max justify-self-end bg-transparent !p-0"
                     onPress={() => setIsOpen(false)}
                  >
                     <CloseRoundedIcon className="!fill-black" />
                  </Button>
               </div>
               <>
                  {mode == Mode.new ? (
                     <CreateUserForm
                        newUser={newUserOutline}
                        setNewUser={setNewUserOutline}
                        errors={formErrors}
                     />
                  ) : (
                     <ExistentUserSelector
                        setSelectedUser={setSelectedUser}
                        selectedUser={selectedUser}
                        users={users}
                     />
                  )}
               </>
               <div className="m-auto grid w-2/3 grid-cols-2 gap-5">
                  <Button
                     onPress={() => {
                        setSelectedUser(selectedUserId);
                        setIsOpen(false);
                     }}
                     variant={Variant.secondary}
                  >
                     Cancelar
                  </Button>
                  <Button onPress={save}>Añadir paciente</Button>
               </div>
            </Dialog>
         )}
      </ModalTrigger>
   );
}

function ModalTabs({
   setMode,
   mode,
}: {
   setMode: Dispatch<SetStateAction<Mode>>;
   mode: Mode;
}) {
   return (
      <Tabs
         onSelectionChange={key => setMode(Number(key))}
         noTabPanel
         aria-label="change mode"
         selectedKey={mode.toString()}
      >
         <Item key={Mode.new} title="Nuevo">
            {true}
         </Item>
         <Item key={Mode.existent} title="Existente">
            {true}
         </Item>
      </Tabs>
   );
}
