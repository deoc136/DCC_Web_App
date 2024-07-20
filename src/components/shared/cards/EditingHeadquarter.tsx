'use client';

import ComboBox from '@/components/inputs/ComboBox';
import TextField from '@/components/inputs/TextField';
import { ChangeValuesFunction } from '../../../app/software-owner/management/clinics/[slug]/edit/views/EditView';
import { Headquarter } from '@/types/headquarter';
import { ZodIssue } from 'zod';
import { Item } from 'react-stately';
import { Catalog } from '@/types/catalog';
import { useState } from 'react';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import Button from '@/components/shared/Button';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import { onlyLettersRegex, onlyNumbersRegex } from '@/lib/regex';

interface IEditingHeadquarter {
   i: number;
   changeValues: ChangeValuesFunction;
   quarter: Omit<Headquarter, 'city'> & { city: string };
   errors: ZodIssue[] | undefined;
   country: string;
   cities: Catalog[];
   deleteHeadquarter: (index: number) => void;
   allowDelete?: boolean;
}

export default function EditingHeadquarter({
   i,
   changeValues,
   quarter,
   errors,
   country,
   cities,
   deleteHeadquarter,
   allowDelete = true,
}: IEditingHeadquarter) {
   const [isOpen, setIsOpen] = useState(true);

   return (
      <article>
         <div className="col-span-full grid grid-cols-[1fr_auto_1fr_1fr] items-center gap-2 border-b border-on-background-disabled pb-5">
            <TextField
               aria-label="Headquarter name input"
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
                     changeValues('headquarters', 'name', val, i);
                  }
               }}
            />
            <div className="my-2 text-on-background-text">-</div>
            <h3 className="text-base font-normal text-on-background-text">
               {i > 0 ? `Sede ${i + 1}` : 'Sede principal'}
            </h3>
            <div className="self-end justify-self-end">
               {allowDelete && (
                  <Button
                     onPress={() => deleteHeadquarter(i)}
                     className="w-min bg-transparent !p-0"
                  >
                     <DeleteRoundedIcon className="text-error" />
                  </Button>
               )}
               <Button
                  className="ml-2 w-min bg-transparent !p-0"
                  onPress={() => setIsOpen(prev => !prev)}
               >
                  {isOpen ? (
                     <KeyboardArrowUpRoundedIcon className="!fill-secondary" />
                  ) : (
                     <KeyboardArrowDownRoundedIcon className="!fill-secondary" />
                  )}
               </Button>
            </div>
         </div>
         {isOpen && (
            <div className="mt-5 grid grid-cols-2 gap-5">
               <ComboBox
                  id="city-switcher"
                  placeholder="Ingresar ciudad"
                  label="Ciudad"
                  isDisabled={!country}
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
                     changeValues('headquarters', 'city', val as any, i)
                  }
               >
                  {cities
                     .filter(
                        city => city.parent_catalog_id.toString() === country,
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
                  onChange={val =>
                     changeValues('headquarters', 'address', val, i)
                  }
               />
               <TextField
                  label="Número de teléfono"
                  placeholder="Ingresar número"
                  value={quarter.phone}
                  errorMessage={
                     errors?.find(
                        error =>
                           error.path.at(0) === 'headquarters' &&
                           error.path.at(1) === i &&
                           error.path.at(2) === 'phone',
                     )?.message
                  }
                  onChange={val => {
                     if (onlyNumbersRegex.test(val) || val === '') {
                        changeValues('headquarters', 'phone', val, i);
                     }
                  }}
               />
            </div>
         )}
      </article>
   );
}
