'use client';

import InputFile from '@/components/inputs/InputFile';
import TextField from '@/components/inputs/TextField';
import { TimeField } from '@/components/inputs/TimeField';
import Button, { Variant } from '@/components/shared/Button';
import Checkbox from '@/components/shared/Checkbox';
import ServicePackage from '@/components/shared/ServicePackage';
import useClinicCurrency from '@/lib/hooks/useClinicCurrency';
import { onlyLettersRegex, onlyNumbersRegex } from '@/lib/regex';
import { NewService } from '@/types/service';
import { Time } from '@internationalized/date';
import { AddRounded } from '@mui/icons-material';
import {
   ChangeEvent,
   Dispatch,
   DragEvent,
   SetStateAction,
   useRef,
} from 'react';
import { ZodIssue } from 'zod';
import { ServiceType } from '../create/views/CreationView';

interface IServiceForm {
   changeValue<T extends keyof ServiceType>(
      param: T,
      value: ServiceType[T],
   ): void;
   errors: ZodIssue[] | undefined;
   values: ServiceType;
   packages: NewPackage[];
   setCreatingPackage: Dispatch<SetStateAction<boolean>>;
   setEditingPackage: Dispatch<SetStateAction<number | undefined>>;
   setDeletingPackage: Dispatch<SetStateAction<number | undefined>>;
}

export default function ServiceForm({
   changeValue,
   errors,
   values,
   setCreatingPackage,
   packages,
   setEditingPackage,
   setDeletingPackage,
}: IServiceForm) {
   const clinicCurrency = useClinicCurrency();

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

      changeValue(
         'image',
         (() => {
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
      );
   }

   function imageInputHandler(e: ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.item(0);

      changeValue(
         'image',
         (() => {
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
      );
   }

   return (
      <div>
         <h2 className="font-semibold">Datos Generales</h2>
         <section className="mx-20 my-10 grid grid-cols-2 gap-5">
            <TextField
               label="Nombre del servicio"
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
               label="Precio de la sesión"
               endIcon={<div>{clinicCurrency}</div>}
               placeholder="Ingresar precio"
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
            <TimeField
               hourCycle={24}
               label="Duración del servicio"
               granularity="second"
               value={new Time(0, 0, 0).add({
                  seconds: Number(values.service_duration),
               })}
               errorMessage={
                  errors?.find(error => error.path.at(0) === 'service_duration')
                     ?.message
               }
               onChange={val => {
                  changeValue(
                     'service_duration',
                     (
                        val.second +
                        val.minute * 60 +
                        val.hour * 3600
                     ).toString(),
                  );
               }}
            />
            <div>
               <Checkbox
                  isSelected={values.has_pause}
                  className="mb-2"
                  onChange={val => {
                     if (!val) {
                        changeValue('pause_duration', '0');
                     }
                     changeValue('has_pause', val);
                  }}
               >
                  Agregar tiempo entre sesiones
               </Checkbox>
               <TimeField
                  granularity="second"
                  hourCycle={24}
                  isDisabled={!values.has_pause}
                  value={new Time(0, 0, 0).add({
                     seconds: Number(values.pause_duration ?? '0'),
                  })}
                  errorMessage={
                     errors?.find(
                        error => error.path.at(0) === 'pause_duration',
                     )?.message
                  }
                  onChange={val => {
                     changeValue(
                        'pause_duration',
                        (
                           val.second +
                           val.minute * 60 +
                           val.hour * 3600
                        ).toString(),
                     );
                  }}
               />
            </div>
            <div className="col-span-full">
               <TextField
                  rows={9}
                  isTextArea
                  label="Descripción del servicio"
                  placeholder="Ingresar descripción"
                  value={values.description}
                  errorMessage={
                     errors?.find(error => error.path.at(0) === 'description')
                        ?.message
                  }
                  onChange={val => changeValue('description', val)}
               />
            </div>
            <div className="col-span-full">
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
                  {
                     errors?.find(error => error.path.at(0) === 'picture_url')
                        ?.message
                  }
               </div>
            </div>
         </section>
         <div className="flex justify-between">
            <h2 className="font-semibold">Paquetes de servicio</h2>
            <Button
               className="flex !w-max items-center gap-2"
               variant={Variant.secondary}
               onPress={() => setCreatingPackage(true)}
            >
               <AddRounded />
               Crear paquete
            </Button>
         </div>
         <section
            className={`mx-20 my-10 grid gap-5 ${
               packages.length > 1 && 'grid-cols-2'
            }`}
         >
            {packages.length > 0 ? (
               packages.map(($package, i) => (
                  <ServicePackage
                     key={i}
                     index={i}
                     setEditingPackage={setEditingPackage}
                     setDeletingPackage={setDeletingPackage}
                     servicePackage={$package}
                  />
               ))
            ) : (
               <p className="col-span-2 my-10 w-full text-center font-semibold">
                  No has creado ningún paquete
               </p>
            )}
         </section>
      </div>
   );
}
