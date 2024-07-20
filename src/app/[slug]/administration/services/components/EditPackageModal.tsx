'use client';

import Dialog from '@/components/modal/Dialog';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Button, { Variant } from '@/components/shared/Button';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { onlyLettersRegex, onlyNumbersRegex } from '@/lib/regex';
import { maxLengthError, nonEmptyMessage } from '@/lib/validations';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { ZodError, z } from 'zod';
import PackageForm from './PackageForm';

interface IEditPackageModal {
   isOpen: boolean;
   setEditingPackage: Dispatch<SetStateAction<number | undefined>>;
   setPackages: Dispatch<SetStateAction<Package[]>>;
   servicePackage: Package;
   editingPackage: number;
}

const initialValues = {
   id: -1,
   description: '',
   name: '',
   price: '',
   quantity: '',
   service_id: -1,
};

export default function EditPackageModal({
   isOpen,
   setEditingPackage,
   setPackages,
   editingPackage,
   servicePackage,
}: IEditPackageModal) {
   const [values, setValues] = useState(servicePackage);

   const [errors, setErrors] = useState<ZodError['errors']>();

   const valuesSchema = z.object({
      name: z
         .string()
         .nonempty(nonEmptyMessage)
         .max(70, maxLengthError(70))
         .regex(
            onlyLettersRegex,
            'El nombre solo puede contener letras y espacios.',
         ),
      quantity: z
         .string()
         .nonempty(nonEmptyMessage)
         .regex(
            onlyNumbersRegex,
            'La cantidad solo puede contener números y puntos.',
         ),
      price: z
         .string()
         .nonempty(nonEmptyMessage)
         .regex(
            onlyNumbersRegex,
            'El precio solo puede contener números y puntos.',
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

   const isEmpty = Object.values(values).some(
      value => value.toString().length <= 0,
   );

   function edit() {
      setErrors(undefined);

      const valuesParsing = valuesSchema.safeParse(values);

      if (valuesParsing.success) {
         setPackages(prev => {
            const aux = [...prev];
            aux[editingPackage] = values;

            return aux;
         });
         setEditingPackage(undefined);
         setValues(initialValues);
      } else {
         setErrors(valuesParsing.error.errors);
      }
   }

   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="grid w-[60vw] max-w-screen-lg gap-14 rounded-xl p-8">
               <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">
                     Editar paquete de servicio
                  </h3>
                  <Button
                     className="!w-max justify-self-end bg-transparent !p-0"
                     onPress={() => setEditingPackage(undefined)}
                  >
                     <CloseRoundedIcon className="!fill-black" />
                  </Button>
               </div>
               <PackageForm
                  changeValue={changeValue}
                  errors={errors}
                  values={values}
               />
               <div className="flex justify-center gap-5">
                  <Button
                     onPress={() => setEditingPackage(undefined)}
                     variant={Variant.secondary}
                     className="!w-max !px-24"
                  >
                     Cancelar
                  </Button>
                  <Button
                     isDisabled={isEmpty}
                     onPress={edit}
                     className="!w-max !px-24"
                  >
                     Guardar cambios
                  </Button>
               </div>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
