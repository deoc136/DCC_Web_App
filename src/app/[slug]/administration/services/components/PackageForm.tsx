'use client';

import ComboBox from '@/components/inputs/ComboBox';
import TextField from '@/components/inputs/TextField';
import useClinicCurrency from '@/lib/hooks/useClinicCurrency';
import { onlyLettersRegex, onlyNumbersRegex } from '@/lib/regex';
import { formatPrice } from '@/lib/utils';
import { Item } from 'react-stately';
import { z } from 'zod';

interface IPackageForm {
   values: NewPackage;
   errors: z.ZodIssue[] | undefined;
   changeValue<
      T extends 'name' | 'quantity' | 'price' | 'description' | 'service_id',
   >(
      param: T,
      value: {
         description: string;
         name: string;
         price: string;
         quantity: string;
         service_id: number;
      }[T],
   ): void;
}

export default function PackageForm({
   values,
   changeValue,
   errors,
}: IPackageForm) {
   const clinicCurrency = useClinicCurrency();
   return (
      <section className="grid grid-cols-2 gap-5">
         <TextField
            label="Nombre del paquete"
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
         <TextField
            label="Número de sesiones"
            placeholder="Ingresar número"
            value={values.quantity}
            errorMessage={
               errors?.find(error => error.path.at(0) === 'quantity')?.message
            }
            onChange={val => {
               if (onlyNumbersRegex.test(val) || val === '') {
                  changeValue('quantity', val);
               }
            }}
         />
         <TextField
            label="Precio del paquete"
            endIcon={<div>{clinicCurrency}</div>}
            placeholder={formatPrice(0, clinicCurrency)}
            value={values.price}
            errorMessage={
               errors?.find(error => error.path.at(0) === 'price')?.message
            }
            onChange={val => {
               if (onlyNumbersRegex.test(val) || val === '') {
                  changeValue('price', val);
               }
            }}
         />
         <div className="col-span-full">
            <TextField
               rows={9}
               isTextArea
               label="Descripción del paquete"
               placeholder="Ingresar descripción"
               value={values.description}
               errorMessage={
                  errors?.find(error => error.path.at(0) === 'description')
                     ?.message
               }
               onChange={val => changeValue('description', val)}
            />
         </div>
      </section>
   );
}
