'use client';

import Dialog from '@/components/modal/Dialog';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Button, { Variant } from '@/components/shared/Button';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Tabs } from '@/components/shared/Tabs';
import { Item } from 'react-stately';
import { NewUser, NewUserOutline, User } from '@/types/user';
import { ChangeValuesFunction } from '../views/EditView';
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
   role: 'ADMINISTRATOR',
   phone: '',
};

interface IChangeAdminModal {
   isOpen: boolean;
   setIsOpen: Dispatch<SetStateAction<boolean>>;
   selectedAdminId: string | null;
   users: User[];
   changeValues: ChangeValuesFunction;
   newAdmin: NewUser | undefined;
   setNewAdmin: Dispatch<SetStateAction<NewUser | undefined>>;
}

export default function ChangeAdminModal({
   isOpen,
   setIsOpen,
   users,
   changeValues,
   selectedAdminId,
   newAdmin,
   setNewAdmin,
}: IChangeAdminModal) {
   const [mode, setMode] = useState(newAdmin ? Mode.new : Mode.existent);

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
   });

   const [formErrors, setFormErrors] = useState<ZodError['errors']>();

   const [selectedAdmin, setSelectedAdmin] = useState(selectedAdminId);

   const [newAdminOutline, setNewAdminOutline] = useState<
      NewUserOutline | undefined
   >(newAdmin);

   function save() {
      if (!!newAdminOutline) {
         setFormErrors(undefined);
         const parsing = administratorSchema.safeParse(newAdminOutline);

         if (parsing.success) {
            setNewAdmin({
               ...newAdminOutline,
               enabled: true,
               address: '',
               profile_picture: '',
               cognito_id: '',
               role: 'ADMINISTRATOR',
               date_created: new Date(),
            });
         } else {
            setFormErrors(parsing.error.errors);
            return;
         }
      } else {
         setNewAdmin(undefined);
         changeValues('clinic', 'administrator_id', selectedAdmin, null);
      }

      setIsOpen(false);
   }

   useEffect(() => {
      if (mode === Mode.existent) {
         setNewAdminOutline(undefined);
         setFormErrors(undefined);
      } else {
         setNewAdminOutline(emptyNewAdmin);
      }
   }, [mode]);

   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="flex w-[60vw] max-w-screen-lg flex-col gap-6 rounded-xl p-7">
               <div className="grid grid-cols-[auto_auto_1fr] items-baseline justify-between gap-5">
                  <h2 className="text-2xl font-semibold">
                     Cambiar administrador
                  </h2>
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
                        newUser={newAdminOutline}
                        setNewUser={setNewAdminOutline}
                        errors={formErrors}
                     />
                  ) : (
                     <ExistentUserSelector
                        setSelectedUser={setSelectedAdmin}
                        selectedUser={selectedAdmin}
                        users={users}
                     />
                  )}
               </>
               <div className="m-auto grid w-2/3 grid-cols-2 gap-5">
                  <Button
                     onPress={() => {
                        setSelectedAdmin(selectedAdminId);
                        setIsOpen(false);
                     }}
                     variant={Variant.secondary}
                  >
                     Cancelar
                  </Button>
                  <Button onPress={save}>Cambiar administrador</Button>
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
         <Item key={Mode.existent} title="Existente">
            {true}
         </Item>
         <Item key={Mode.new} title="Nuevo">
            {true}
         </Item>
      </Tabs>
   );
}
