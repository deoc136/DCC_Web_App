'use client';

import ComboBox from '@/components/inputs/ComboBox';
import TextField from '@/components/inputs/TextField';
import Button, { Variant } from '@/components/shared/Button';
import { Item } from 'react-stately';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import {
   ChangeEvent,
   Dispatch,
   DragEvent,
   SetStateAction,
   useRef,
} from 'react';
import { Values } from '../values';
import { Catalog } from '@/types/catalog';
import { z } from 'zod';
import InputFile from '@/components/inputs/InputFile';
import { onlyLettersRegex, onlyNumbersRegex } from '@/lib/regex';

interface IClinicForm {
   valuesState: [Values, Dispatch<SetStateAction<Values>>];
   cities: Catalog[];
   id_type: Catalog[];
   countries: Catalog[];
   errors: z.ZodIssue[] | undefined;
}

export default function ClinicForm({
   valuesState,
   cities,
   countries,
   id_type,
   errors,
}: IClinicForm) {
   const [values, setValues] = valuesState;

   const inputFileRef = useRef<HTMLInputElement>(null);

   async function dropHandler(e: DragEvent<HTMLDivElement>) {
      e.currentTarget.classList.remove('border-primary', '!border-solid');

      let file: File | undefined | null = undefined;

      e.preventDefault();

      if (e.dataTransfer.items) {
         file = [...e.dataTransfer.items].at(0)?.getAsFile();
      } else {
         file = [...e.dataTransfer.items].at(0);
      }

      setValues(prev => ({
         ...prev,
         image: (() => {
            if (file) {
               if (file.size > 10000000) {
                  return 'El tamaño es mayor al indicado';
               } else if (
                  file.type === 'image/png' ||
                  file.type === 'image/jpg' ||
                  file.type === 'image/jpeg'
               ) {
                  return file;
               } else {
                  return 'Ingresar un tipo de archivo valido';
               }
            }
         })(),
      }));
   }

   function imageInputHandler(e: ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.item(0);

      setValues(prev => ({
         ...prev,
         image: (() => {
            if (file) {
               if (file.size > 10000000) {
                  return 'El tamaño es mayor al indicado';
               } else if (
                  file.type === 'image/png' ||
                  file.type === 'image/jpg' ||
                  file.type === 'image/jpeg'
               ) {
                  return file;
               } else {
                  return 'Ingresar un tipo de archivo valido';
               }
            }
         })(),
      }));
   }

   function changeValue(
      param: keyof typeof values,
      value: (typeof values)[typeof param],
   ) {
      setValues(prev => ({ ...prev, [param]: value }));
   }

   function changeHeadquarterValue(
      index: number,
      param: keyof (typeof values)['headquarters'][number],
      value: (typeof values)['headquarters'][number][typeof param],
   ) {
      setValues(prev => {
         const aux = [...prev.headquarters];

         aux[index] = { ...aux[index], [param]: value };

         return { ...prev, headquarters: aux };
      });
   }

   function addHeadquarter() {
      setValues(prev => {
         const aux = [...prev.headquarters];

         aux.push({
            address: '',
            city: '',
            name: '',
            phoneNumber: '',
            index: aux.length,
            removed: false,
         });

         return { ...prev, headquarters: aux };
      });
   }

   function deleteHeadquarter(index: number) {
      setValues(prev => {
         const aux = [...prev.headquarters];

         aux.splice(index, 1);

         return { ...prev, headquarters: aux };
      });
   }

   return (
      <div>
         <h2 className="font-semibold">Datos Generales</h2>
         <section className="mx-20 my-10 grid grid-cols-2 gap-5">
            <TextField
               label="Nombre de Clínica o Razón social"
               placeholder="Ingresar nombre"
               value={values.name}
               errorMessage={
                  errors?.find(error => error.path.at(0) === 'name')?.message
               }
               onChange={val => {
                  if (onlyLettersRegex.test(val) || val === '') {
                     changeValue('name', val);
                     changeValue(
                        'slug',
                        val
                           .split(' ')
                           .map(word => word.toLowerCase())
                           .join('_'),
                     );
                  }
               }}
               description={
                  values.name && `El slug de tu clínica será '${values.slug}'`
               }
            />
            <ComboBox
               id="country-switcher"
               placeholder="Ingresar país"
               label="País"
               selectedKey={values.country}
               errorMessage={
                  errors?.find(error => error.path.at(0) === 'country')?.message
               }
               onSelectionChange={val =>
                  changeValue('country', val?.toString())
               }
            >
               {countries.map(country => (
                  <Item key={country.id} textValue={country.name}>
                     <div className="px-4 py-3 hover:bg-primary-100">
                        {country.name}
                     </div>
                  </Item>
               ))}
            </ComboBox>
            <div className="col-span-full">
               <TextField
                  label="Página Web"
                  placeholder="Ingresar URL"
                  value={values.webPage}
                  errorMessage={
                     errors?.find(error => error.path.at(0) === 'webPage')
                        ?.message
                  }
                  onChange={val => changeValue('webPage', val)}
               />
            </div>
            <ComboBox
               placeholder="Ingresar tipo"
               label="Tipo de identificación"
               selectedKey={values.documentType}
               onSelectionChange={val =>
                  changeValue('documentType', val?.toString())
               }
               errorMessage={
                  errors?.find(error => error.path.at(0) === 'documentType')
                     ?.message
               }
               isDisabled={!values.country}
            >
               {id_type.map(type => (
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
               value={values.document}
               errorMessage={
                  errors?.find(error => error.path.at(0) === 'document')
                     ?.message
               }
               onChange={val => changeValue('document', val)}
            />
            <TextField
               label="PayPal client ID"
               placeholder="Ingresar el identificador"
               value={values.paypal_id}
               errorMessage={
                  errors?.find(error => error.path.at(0) === 'paypal_id')
                     ?.message
               }
               onChange={val => changeValue('paypal_id', val)}
            />
            <TextField
               label="PayPal secret key"
               placeholder="Ingresar el key"
               value={values.paypal_secret_key}
               errorMessage={
                  errors?.find(
                     error => error.path.at(0) === 'paypal_secret_key',
                  )?.message
               }
               onChange={val => changeValue('paypal_secret_key', val)}
            />
            <InputFile
               dropHandler={dropHandler}
               imageInputHandler={imageInputHandler}
               inputFileRef={inputFileRef}
               file={values.image}
               accept="image/jpeg, image/png"
               clearFile={() => changeValue('image', undefined)}
            >
               <>
                  <h4 className="mb-3 text-center font-semibold text-on-background-text">
                     Seleccione o arrastre hasta aquí
                     <br />
                     el logotipo de la empresa
                  </h4>
                  <p className="font-normal text-on-background-text">
                     JPG o PNG, tamaño de archivo no superior a 10 MB
                  </p>
               </>
            </InputFile>
            <div className="mt-4 text-error">
               {errors?.find(error => error.path.at(0) === 'image')?.message}
            </div>
         </section>
         <h2 className="font-semibold">Datos de contacto</h2>
         <section className="mx-20 my-10 grid gap-10">
            {values.headquarters.map((quarter, i) => (
               <article key={i} className="grid grid-cols-2 gap-5">
                  <div className="col-span-full flex justify-between border-b border-on-background-disabled pb-5">
                     <h3 className="text-base text-on-background-text">
                        {i > 0 ? `Sede ${i + 1}` : 'Sede principal'}
                     </h3>
                     {i > 0 && (
                        <Button
                           onPress={() => deleteHeadquarter(i)}
                           className="w-min bg-transparent !p-0"
                        >
                           <DeleteRoundedIcon className="text-error" />
                        </Button>
                     )}
                  </div>
                  <TextField
                     label="Nombre de la sede"
                     placeholder="Ingresar nombre"
                     value={quarter.name}
                     errorMessage={
                        errors?.find(
                           error =>
                              error.path.at(0) === 'headquarters' &&
                              error.path.at(1) === i &&
                              error.path.at(2) === 'name',
                        )?.message
                     }
                     onChange={val => {
                        if (onlyLettersRegex.test(val) || val === '') {
                           changeHeadquarterValue(i, 'name', val);
                        }
                     }}
                  />
                  <ComboBox
                     id="city-switcher"
                     placeholder="Ingresar ciudad"
                     label="Ciudad"
                     isDisabled={!values.country}
                     selectedKey={quarter.city}
                     errorMessage={
                        errors?.find(
                           error =>
                              error.path.at(0) === 'headquarters' &&
                              error.path.at(1) === i &&
                              error.path.at(2) === 'city',
                        )?.message
                     }
                     onSelectionChange={val =>
                        changeHeadquarterValue(i, 'city', val as string)
                     }
                  >
                     {cities
                        .filter(
                           city =>
                              city.parent_catalog_id.toString() ===
                              values.country,
                        )
                        .sort(({ name: a }, { name: b }) => a.localeCompare(b))
                        .map(city => (
                           <Item key={city.id} textValue={city.name}>
                              <div className="px-4 py-3 hover:bg-primary-100">
                                 {city.name}
                              </div>
                           </Item>
                        ))}
                  </ComboBox>
                  <TextField
                     label="Dirección"
                     placeholder="Ingresar dirección"
                     value={quarter.address}
                     errorMessage={
                        errors?.find(
                           error =>
                              error.path.at(0) === 'headquarters' &&
                              error.path.at(1) === i &&
                              error.path.at(2) === 'address',
                        )?.message
                     }
                     onChange={val => changeHeadquarterValue(i, 'address', val)}
                  />
                  <TextField
                     label="Número de teléfono"
                     placeholder="Ingresar número"
                     value={quarter.phoneNumber}
                     errorMessage={
                        errors?.find(
                           error =>
                              error.path.at(0) === 'headquarters' &&
                              error.path.at(1) === i &&
                              error.path.at(2) === 'phoneNumber',
                        )?.message
                     }
                     onChange={val => {
                        if (onlyNumbersRegex.test(val) || val === '') {
                           changeHeadquarterValue(i, 'phoneNumber', val);
                        }
                     }}
                  />
               </article>
            ))}
            <Button
               className="w-max"
               onPress={addHeadquarter}
               variant={Variant.secondary}
            >
               Agregar Sede <AddRoundedIcon />
            </Button>
         </section>
      </div>
   );
}
