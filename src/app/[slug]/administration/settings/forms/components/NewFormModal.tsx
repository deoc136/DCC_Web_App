'use client';

import Dialog from '@/components/modal/Dialog';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Button, { Variant } from '@/components/shared/Button';
import {
   ChangeEvent,
   Dispatch,
   SetStateAction,
   useEffect,
   useRef,
   useState,
} from 'react';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import TextField from '@/components/inputs/TextField';
import { onlyLettersRegex } from '@/lib/regex';
import { useRouter } from 'next/navigation';
import {
   FileTrigger,
   Button as FileTriggerButton,
} from 'react-aria-components';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { ZodError, z } from 'zod';
import { maxLengthError, nonEmptyMessage } from '@/lib/validations';
import { uploadFile } from '@/services/files';
import { createForm } from '@/services/forms';

interface INewFormModal {
   isOpen: boolean;
   setIsOpen: Dispatch<SetStateAction<boolean>>;
   slug: string;
}

const initialValues: NewFile = {
   file_name: '',
   public_name: '',
   url: '',
};

export default function NewFormModal({
   isOpen,
   setIsOpen,
   slug,
}: INewFormModal) {
   const router = useRouter();

   const [values, setValues] = useState(initialValues);
   const [file, setFile] = useState<File | string>();

   const [creating, setCreating] = useState(false);

   const [nameError, setNameError] = useState<ZodError>();
   const [creationError, setCreationError] = useState<string>();

   const inputRef = useRef<HTMLInputElement>(null);

   function imageInputHandler(e: ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.item(0);

      setFile(
         (() => {
            if (file) {
               if (file.size > 10000000) {
                  return 'El tamaño es mayor al indicado';
               } else if (file.type === 'application/pdf') {
                  return file;
               } else {
                  return 'Ingresar un tipo de archivo valido';
               }
            }
         })(),
      );
   }

   useEffect(() => {
      setValues(initialValues);
      setFile(undefined);
      setCreating(false);
      setNameError(undefined);
      setCreationError(undefined);
   }, [isOpen]);

   const publicNameSchema = z
      .string()
      .nonempty(nonEmptyMessage)
      .regex(
         onlyLettersRegex,
         'El nombre solo puede contener letras y espacios.',
      )
      .max(70, maxLengthError(70));

   async function create() {
      if (creating || !file || typeof file === 'string') return;

      setNameError(undefined);
      setCreationError(undefined);

      setCreating(true);

      try {
         const parsing = publicNameSchema.safeParse(values.public_name);

         if (parsing.success) {
            const file_url = (await uploadFile(file)).data;

            await createForm(
               {
                  file_name: file.name,
                  public_name: values.public_name,
                  url: file_url,
               },
               slug,
            );

            setIsOpen(false);
            router.refresh();
         } else {
            setNameError(parsing.error);
         }
      } catch (error) {
         setCreationError('Ocurrió un error inesperado');
      }

      setCreating(false);
   }

   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="flex flex-col gap-6 rounded-xl p-7">
               <input
                  onChange={imageInputHandler}
                  ref={inputRef}
                  className="hidden"
                  type="file"
                  accept="application/pdf"
               />
               <div className="flex w-full min-w-[40vw] max-w-screen-lg items-center justify-between">
                  <h2 className="text-2xl font-semibold">
                     Añadir nuevo formulario
                  </h2>
                  <Button
                     className="!w-max bg-transparent !p-0"
                     onPress={() => {
                        setIsOpen(false);
                     }}
                  >
                     <CloseRoundedIcon className="!fill-black" />
                  </Button>
               </div>
               <TextField
                  label="Nombre del formulario"
                  placeholder="Ingresa nombre"
                  value={values.public_name}
                  errorMessage={nameError?.errors.at(0)?.message}
                  onChange={public_name => {
                     if (
                        onlyLettersRegex.test(public_name) ||
                        public_name === ''
                     ) {
                        setValues(prev => ({ ...prev, public_name }));
                     }
                  }}
               />
               <div className="grid w-full items-center gap-x-10">
                  <div className="mb-2 font-semibold text-on-background-text">
                     Cargar documentos
                  </div>
                  <Button
                     onPress={() => inputRef.current?.click()}
                     variant={Variant.outlined}
                     className="!w-max truncate"
                  >
                     {file === undefined
                        ? 'Seleccionar archivo'
                        : typeof file === 'string'
                        ? file
                        : file.name}
                  </Button>
               </div>
               <div className="grid grid-cols-2 gap-5">
                  <Button
                     variant={Variant.secondary}
                     isDisabled={creating}
                     onPress={() => {
                        setIsOpen(false);
                     }}
                  >
                     Cancelar
                  </Button>
                  <Button
                     isDisabled={!values.public_name || !file || creating}
                     onPress={create}
                  >
                     {creating ? (
                        <>
                           Cargando...
                           <RefreshRoundedIcon className="animate-spin" />
                        </>
                     ) : (
                        <>Aceptar</>
                     )}
                  </Button>
                  {creationError && (
                     <div className="col-span-2 w-full text-center text-error">
                        {creationError}
                     </div>
                  )}
               </div>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
