'use client';

import Button, { Variant } from '@/components/shared/Button';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux-hooks';
import { Genre, Role } from '@/types/user';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clinicRoutes } from '@/lib/routes';
import TextField from '@/components/inputs/TextField';
import { ZodError, z } from 'zod';
import { onlyLettersRegex, onlyNumbersRegex } from '@/lib/regex';
import DatePicker from '@/components/inputs/DatePicker';
import { CalendarDate, today } from '@internationalized/date';
import { timezone, translateGenre } from '@/lib/utils';
import ComboBox from '@/components/inputs/ComboBox';
import { Item } from 'react-stately';
import Checkbox from '@/components/shared/Checkbox';
import {
   maxLengthError,
   minLengthError,
   nonEmptyMessage,
   nonUnselectedMessage,
} from '@/lib/validations';
import { editUser } from '@/services/user';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { AxiosError } from 'axios';
import { changeTitle } from '@/lib/features/title/title_slice';
import useDictionary from '@/lib/hooks/useDictionary';

interface ICompleteAccountView {}

export default function CompleteAccountView({}: ICompleteAccountView) {
   const dic = useDictionary();

   const router = useRouter();

   const dispatch = useAppDispatch();

   const clinic = useAppSelector(store => store.clinic);
   const user = useAppSelector(store => store.user);
   const { cities, countries, nationalities, identification_types } =
      useAppSelector(store => store.catalogues);

   const [values, setValues] = useState({
      id: user?.id ?? 0,
      enabled: user?.enabled ?? true,
      names: user?.names ?? '',
      last_names: user?.last_names ?? '',
      phone: user?.phone ?? '',
      address: user?.address ?? '',
      email: user?.email ?? '',
      profile_picture: user?.profile_picture ?? '',
      cognito_id: user?.cognito_id ?? '',
      role: user?.role ?? ('PATIENT' as Role),
      birth_date: user?.birth_date ? new Date(user.birth_date) : new Date(),
      genre: user?.genre ?? ('' as Genre),
      nationality: user?.nationality?.toString() ?? '',
      residence_city: user?.residence_city?.toString() ?? '',
      residence_country:
         user?.residence_country?.toString() ?? clinic.country.toString(),
      identification_type: user?.identification_type?.toString() ?? '',
      identification: user?.identification ?? '',
      retired: user?.retired ?? false,
   });

   const [errors, setErrors] = useState<ZodError['errors']>();

   const [isLoading, setIsLoading] = useState(false);

   const [creationError, setCreationError] = useState<string>();

   const [termsAgree, setTermsAgree] = useState(false);

   function changeValue<T extends keyof typeof values>(
      param: T,
      value: (typeof values)[T],
   ) {
      setValues(prev => ({ ...prev, [param]: value }));
   }

   const valuesSchema = z.object({
      names: z
         .string()
         .nonempty(nonEmptyMessage)
         .min(2, minLengthError(2))
         .max(70, maxLengthError(70))
         .regex(
            onlyLettersRegex,
            'El nombre solo puede contener letras y espacios.',
         ),
      last_names: z
         .string()
         .nonempty(nonEmptyMessage)
         .min(2, minLengthError(2))
         .max(70, maxLengthError(70))
         .regex(
            onlyLettersRegex,
            'El nombre solo puede contener letras y espacios.',
         ),
      birth_date: z.date({ required_error: nonEmptyMessage }),
      email: z
         .string()
         .nonempty(nonEmptyMessage)
         .email('El email debe tener un formato correcto.'),
      phone: z
         .string()
         .nonempty(nonEmptyMessage)
         .max(20, maxLengthError(20))
         .regex(
            onlyNumbersRegex,
            'El teléfono solo puede contener números y espacios.',
         ),
      genre: z.string().nonempty(nonUnselectedMessage),
      nationality: z.string().nonempty(nonUnselectedMessage),
      residence_country: z.string().nonempty(nonUnselectedMessage),
      identification_type: z.string().nonempty(nonUnselectedMessage),
      identification: z.string().nonempty(nonEmptyMessage),
      residence_city: z.string().nonempty(nonUnselectedMessage),
      address: z
         .string()
         .nonempty(nonEmptyMessage)
         .min(5, minLengthError(5))
         .max(100, maxLengthError(100)),
   });

   const todayDate = today(timezone);

   async function send() {
      if (isLoading) return;

      setIsLoading(true);
      setCreationError(undefined);

      try {
         await editUser(
            {
               ...values,
               identification_type: Number(values.identification_type),
               residence_country: Number(values.residence_country),
               residence_city: Number(values.residence_city),
               nationality: Number(values.nationality),
               date_created: new Date(),
            },
            clinic.slug,
         );

         router.refresh();
         router.push(clinicRoutes(clinic.slug).patient_services);
      } catch (error) {
         if ((error as AxiosError).response?.status === 409) {
            setCreationError(
               'El correo electrónico ingresado no está disponible.',
            );
         } else {
            setCreationError('Ocurrió un error inesperado.');
         }

         setIsLoading(false);
      }
   }

   useEffect(() => {
      dispatch(
         changeTitle({
            goBackRoute: null,
            value: dic.texts.flows.complete_profile,
         }),
      );
   }, [dispatch, dic]);

   return (
      <div className="h-full text-sm lg:text-base">
         <div className="grid gap-5">
            <div className="h-full overflow-auto">
               <div className="grid gap-7">
                  <p className="font-semibold text-on-background-text">
                     {dic.texts.flows.complete_profile_large}
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                     <TextField
                        label={dic.texts.users.name}
                        placeholder={dic.inputs.enter_name}
                        value={values.names}
                        errorMessage={
                           errors?.find(error => error.path.at(0) === 'names')
                              ?.message
                        }
                        onChange={val => {
                           if (onlyLettersRegex.test(val) || val === '') {
                              changeValue('names', val);
                           }
                        }}
                     />
                     <TextField
                        label={dic.texts.users.last_names}
                        placeholder={dic.inputs.enter_last_names}
                        value={values.last_names}
                        errorMessage={
                           errors?.find(
                              error => error.path.at(0) === 'last_names',
                           )?.message
                        }
                        onChange={val => {
                           if (onlyLettersRegex.test(val) || val === '') {
                              changeValue('last_names', val);
                           }
                        }}
                     />
                     <DatePicker
                        label={dic.texts.users.birth_date}
                        minValue={(() =>
                           new CalendarDate(
                              1900,
                              todayDate.month,
                              todayDate.day,
                           ))()}
                        maxValue={todayDate}
                        defaultValue={todayDate}
                        errorMessage={
                           errors?.find(
                              error => error.path.at(0) === 'birth_date',
                           )?.message
                        }
                        onChange={val => {
                           changeValue('birth_date', val.toDate(timezone));
                        }}
                     />
                     <TextField
                        label={dic.texts.users.email}
                        value={values.email}
                        isDisabled
                     />
                     <TextField
                        label={dic.texts.users.phone}
                        placeholder={dic.inputs.enter_phone}
                        value={values.phone}
                        errorMessage={
                           errors?.find(error => error.path[0] === 'phone')
                              ?.message
                        }
                        onChange={val => {
                           if (onlyNumbersRegex.test(val) || val === '') {
                              changeValue('phone', val);
                           }
                        }}
                     />
                     <ComboBox
                        label={dic.texts.users.sex}
                        placeholder={dic.inputs.select_sex}
                        selectedKey={values.genre.toString()}
                        errorMessage={
                           errors?.find(error => error.path[0] === 'genre')
                              ?.message
                        }
                        onSelectionChange={val => {
                           val && changeValue('genre', val.toString() as Genre);
                        }}
                     >
                        {(['FEMALE', 'MALE', 'OTHER'] as const).map(genre => (
                           <Item key={genre} textValue={translateGenre(genre)}>
                              <div className="px-4 py-3 hover:bg-primary-100">
                                 {translateGenre(genre)}
                              </div>
                           </Item>
                        ))}
                     </ComboBox>
                     <ComboBox
                        label={dic.texts.users.nationality}
                        placeholder={dic.inputs.enter_nationality}
                        selectedKey={values.nationality.toString()}
                        errorMessage={
                           errors?.find(
                              error => error.path[0] === 'nationality',
                           )?.message
                        }
                        onSelectionChange={val => {
                           val && changeValue('nationality', val.toString());
                        }}
                     >
                        {nationalities.map(nationality => (
                           <Item
                              key={nationality.id}
                              textValue={nationality.display_name}
                           >
                              <div className="px-4 py-3 hover:bg-primary-100">
                                 {nationality.display_name}
                              </div>
                           </Item>
                        ))}
                     </ComboBox>
                     <ComboBox
                        label={dic.texts.users.residence_country}
                        placeholder={dic.inputs.select_country}
                        selectedKey={values.residence_country.toString()}
                        errorMessage={
                           errors?.find(
                              error => error.path[0] === 'residence_country',
                           )?.message
                        }
                        onSelectionChange={val =>
                           val &&
                           setValues(prev => ({
                              ...prev,
                              residence_country: val.toString(),
                              residence_city: '',
                              identification_type: '',
                           }))
                        }
                     >
                        {countries.map(country => (
                           <Item
                              key={country.id}
                              textValue={country.display_name}
                           >
                              <div className="px-4 py-3 hover:bg-primary-100">
                                 {country.display_name}
                              </div>
                           </Item>
                        ))}
                     </ComboBox>
                     <ComboBox
                        isDisabled={!values.residence_country}
                        label={dic.texts.users.identification_type}
                        placeholder={dic.inputs.select_type}
                        selectedKey={values.identification_type.toString()}
                        errorMessage={
                           errors?.find(
                              error => error.path[0] === 'identification_type',
                           )?.message
                        }
                        onSelectionChange={val => {
                           val &&
                              changeValue(
                                 'identification_type',
                                 val.toString(),
                              );
                        }}
                     >
                        {identification_types
                           .filter(
                              ({ parent_catalog_id }) =>
                                 parent_catalog_id.toString() ===
                                 values.residence_country,
                           )
                           .map(identificationType => (
                              <Item
                                 key={identificationType.id}
                                 textValue={identificationType.display_name}
                              >
                                 <div className="px-4 py-3 hover:bg-primary-100">
                                    {identificationType.display_name}
                                 </div>
                              </Item>
                           ))}
                     </ComboBox>
                     <TextField
                        label={dic.texts.users.identification_number}
                        placeholder={dic.inputs.enter_number}
                        value={values.identification}
                        errorMessage={
                           errors?.find(
                              error => error.path[0] === 'identification',
                           )?.message
                        }
                        onChange={val => changeValue('identification', val)}
                     />
                     <ComboBox
                        isDisabled={!values.residence_country}
                        label={dic.texts.users.residence_city}
                        placeholder={dic.inputs.select_city}
                        selectedKey={values.residence_city.toString()}
                        errorMessage={
                           errors?.find(
                              error => error.path[0] === 'residence_city',
                           )?.message
                        }
                        onSelectionChange={val => {
                           val && changeValue('residence_city', val.toString());
                        }}
                     >
                        {cities
                           .filter(
                              ({ parent_catalog_id }) =>
                                 parent_catalog_id.toString() ===
                                 values.residence_country,
                           )
                           .sort(({ name: a }, { name: b }) =>
                              a.localeCompare(b),
                           )
                           .map(city => (
                              <Item key={city.id} textValue={city.display_name}>
                                 <div className="px-4 py-3 hover:bg-primary-100">
                                    {city.display_name}
                                 </div>
                              </Item>
                           ))}
                     </ComboBox>
                     <TextField
                        label={dic.texts.users.address}
                        placeholder={dic.inputs.enter_address}
                        value={values.address}
                        errorMessage={
                           errors?.find(error => error.path[0] === 'address')
                              ?.message
                        }
                        onChange={val => changeValue('address', val)}
                     />
                     <Checkbox
                        className="md:col-span-2 lg:text-base"
                        isSelected={termsAgree}
                        onChange={setTermsAgree}
                     >
                        <span className="font-normal text-black">
                           {dic.pages.auth.sign_up.agree_policies}
                        </span>
                     </Checkbox>
                  </div>
               </div>
            </div>
            <div className="sticky bottom-0 grid gap-5 bg-white py-5 lg:relative lg:py-0">
               {creationError && (
                  <div className="w-full flex-none text-center text-error lg:text-end">
                     {creationError}
                  </div>
               )}
               <Button
                  onPress={() => {
                     setErrors(undefined);
                     const valuesParsing = valuesSchema.safeParse(values);
                     valuesParsing.success
                        ? send()
                        : setErrors(valuesParsing.error.errors);
                  }}
                  isDisabled={!termsAgree || isLoading}
                  className="flex items-center justify-center gap-2 justify-self-end lg:w-max lg:!px-24"
               >
                  {isLoading ? (
                     <>
                        {dic.texts.flows.loading}...
                        <RefreshRoundedIcon className="animate-spin" />
                     </>
                  ) : (
                     dic.texts.flows.update_data
                  )}
               </Button>
            </div>
         </div>
      </div>
   );
}
