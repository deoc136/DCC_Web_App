'use client';

import { Dispatch, SetStateAction } from 'react';
import TextField from '@/components/inputs/TextField';
import { z } from 'zod';
import { onlyLettersRegex, onlyNumbersRegex } from '@/lib/regex';
import { NewUser } from '@/types/user';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import ComboBox from '@/components/inputs/ComboBox';
import { Item } from 'react-stately';
import { NewUserWithStrings } from '../create/views/CreationView';

interface IPersonalDataForm {
   values: NewUserWithStrings;
   setValues: Dispatch<SetStateAction<NewUserWithStrings>>;
   errors: z.ZodIssue[] | undefined;
}

export default function PersonalDataForm({
   setValues,
   values,
   errors,
}: IPersonalDataForm) {
   function changeValue<T extends keyof NewUserWithStrings>(
      param: T,
      value: NewUserWithStrings[T],
   ) {
      setValues(prev => ({
         ...prev,
         [param]: value,
      }));
   }

   const { identification_types } = useAppSelector(store => store.catalogues);
   const { country } = useAppSelector(store => store.clinic);

   return (
      <div className="mb-10 grid gap-10">
         <h2 className="font-semibold">Datos personales</h2>
         <section className="mx-20 grid grid-cols-2 gap-5">
            <TextField
               label="Nombres"
               placeholder="Ingresar nombres"
               value={values.names}
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
               value={values.last_names}
               errorMessage={
                  errors?.find(error => error.path.at(0) === 'last_names')
                     ?.message
               }
               onChange={val => {
                  if (onlyLettersRegex.test(val) || val === '') {
                     changeValue('last_names', val);
                  }
               }}
            />
            <TextField
               type="email"
               label="Correo electrónico"
               placeholder="Ingresar correo electrónico"
               value={values.email}
               errorMessage={
                  errors?.find(error => error.path.at(0) === 'email')?.message
               }
               onChange={val => changeValue('email', val)}
            />
            <TextField
               label="Número de teléfono"
               placeholder="Ingresar número"
               value={values.phone}
               errorMessage={
                  errors?.find(error => error.path.at(0) === 'phone')?.message
               }
               onChange={val => {
                  if (onlyNumbersRegex.test(val) || val === '') {
                     changeValue('phone', val);
                  }
               }}
            />
            <div className="col-span-2">
               <TextField
                  label="Dirección de residencia"
                  placeholder="Ingresar dirección"
                  value={values.address}
                  errorMessage={
                     errors?.find(error => error.path.at(0) === 'address')
                        ?.message
                  }
                  onChange={val => {
                     changeValue('address', val);
                  }}
               />
            </div>
            <ComboBox
               placeholder="Ingresar tipo"
               label="Tipo de identificación"
               selectedKey={values.identification_type}
               onSelectionChange={val => {
                  val && changeValue('identification_type', val.toString());
               }}
               errorMessage={
                  errors?.find(
                     error => error.path.at(0) === 'identification_type',
                  )?.message
               }
            >
               {identification_types
                  .filter(type => type.parent_catalog_id === country)
                  .map(type => (
                     <Item key={type.id} textValue={type.name}>
                        <div className="px-4 py-3 hover:bg-primary-100">
                           {type.name}
                        </div>
                     </Item>
                  ))}
            </ComboBox>
            <TextField
               label="Número de identificación"
               placeholder="Ingresar número"
               value={values.identification}
               errorMessage={
                  errors?.find(error => error.path.at(0) === 'identification')
                     ?.message
               }
               onChange={val => changeValue('identification', val)}
            />
         </section>
      </div>
   );
}
