'use client';

import { Dispatch, SetStateAction } from 'react';
import TextField from '@/components/inputs/TextField';
import { Values } from '../values';
import { z } from 'zod';
import { onlyLettersRegex, onlyNumbersRegex } from '@/lib/regex';

interface IAdministratorForm {
   valuesState: [Values, Dispatch<SetStateAction<Values>>];
   errors: z.ZodIssue[] | undefined;
}

export default function AdministratorForm({
   valuesState,
   errors,
}: IAdministratorForm) {
   const [values, setValues] = valuesState;

   function changeValue(
      param: keyof (typeof values)['administrator'],
      value: (typeof values)['administrator'][typeof param],
   ) {
      setValues(prev => ({
         ...prev,
         administrator: {
            ...prev.administrator,
            [param]: value,
         },
      }));
   }

   return (
      <div>
         <h2 className="font-semibold">
            Datos del Administrador Master de la clínica
         </h2>
         <section className="mx-20 my-10 grid grid-cols-2 gap-5">
            <TextField
               label="Nombres"
               placeholder="Ingresar nombres"
               value={values.administrator.names}
               errorMessage={
                  errors?.find(error => error.path.at(0) === 'names')?.message
               }
               onChange={val => {
                  if (onlyLettersRegex.test(val) || val === '') {
                     changeValue('names', val);
                  }
               }}
            />
            <TextField
               label="Apellidos"
               placeholder="Ingresar apellidos"
               value={values.administrator.lastNames}
               errorMessage={
                  errors?.find(error => error.path.at(0) === 'lastNames')
                     ?.message
               }
               onChange={val => changeValue('lastNames', val)}
            />
            <TextField
               type="email"
               label="Correo electrónico"
               placeholder="Ingresar correo electrónico"
               value={values.administrator.email}
               errorMessage={
                  errors?.find(error => error.path.at(0) === 'email')?.message
               }
               onChange={val => changeValue('email', val)}
            />
            <TextField
               label="Número de teléfono"
               placeholder="Ingresar número"
               value={values.administrator.phone}
               errorMessage={
                  errors?.find(error => error.path.at(0) === 'phone')?.message
               }
               onChange={val => {
                  if (onlyNumbersRegex.test(val) || val === '') {
                     changeValue('phone', val);
                  }
               }}
            />
         </section>
      </div>
   );
}
