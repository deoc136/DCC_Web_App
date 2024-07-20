'use client';

import { User } from '@/types/user';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
   cutFullName,
   makeNegativeNumberZero,
   timezone,
   translateGenre,
} from '@/lib/utils';
import PasswordFormModal from '@/components/shared/modals/PasswordFormModal';
import Button, { Variant } from '@/components/shared/Button';
import CreateIcon from '@mui/icons-material/CreateRounded';
import { clinicRoutes } from '@/lib/routes';
import TextField from '@/components/inputs/TextField';
import ComboBox from '@/components/inputs/ComboBox';
import { Item } from 'react-stately';
import { ZodError, z } from 'zod';
import {
   maxLengthError,
   minLengthError,
   nonEmptyMessage,
   nonUnselectedMessage,
} from '@/lib/validations';
import { onlyNumbersRegex } from '@/lib/regex';
import { today } from '@internationalized/date';
import { editUser } from '@/services/user';
import { AxiosError } from 'axios';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CancelConfirmationModal from '@/components/shared/modals/CancelConfirmationModal';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Dialog from '@/components/modal/Dialog';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import MinimalImageInput from '@/components/inputs/MinimalImageInput';
import { uploadFile } from '@/services/files';
import useDictionary from '@/lib/hooks/useDictionary';

interface IEditionView {
   user: User;
   slug: string;
}

export default function EditionView({ user, slug }: IEditionView) {
   const dic = useDictionary();

   const clinic = useAppSelector(store => store.clinic);

   const { nationalities, countries, cities, identification_types } =
      useAppSelector(store => store.catalogues);

   const [openChangePassword, setOpenChangePassword] = useState(false);

   const [values, setValues] = useState({
      ...user,
      birth_date: user?.birth_date ? new Date(user.birth_date) : new Date(),
      nationality: user?.nationality?.toString() ?? '',
      residence_city: user?.residence_city?.toString() ?? '',
      residence_country:
         user?.residence_country?.toString() ?? clinic.country.toString(),
      identification_type: user?.identification_type?.toString() ?? '',
   });

   const [errors, setErrors] = useState<ZodError['errors']>();

   const [isLoading, setIsLoading] = useState(false);

   const [creationError, setCreationError] = useState<string>();

   const [closingOpen, setClosingOpen] = useState(false);
   const [editedOpen, setEditedOpen] = useState(false);

   const [newImage, setNewImage] = useState<File | string>();
   const inputFileRef = useRef<HTMLInputElement>(null);

   function changeValue<T extends keyof typeof values>(
      param: T,
      value: (typeof values)[T],
   ) {
      setValues(prev => ({ ...prev, [param]: value }));
   }

   const valuesSchema = z.object({
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
      residence_country: z.string().nonempty(nonUnselectedMessage),
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
         let profile_picture = values.profile_picture;

         if (newImage) {
            try {
               if (newImage && typeof newImage !== 'string') {
                  profile_picture = (await uploadFile(newImage)).data;
               }
            } catch (error) {
               throw Error('Ocurrió un error subiendo la imagen.');
            }
         }

         await editUser(
            {
               ...values,
               profile_picture,
               identification_type: Number(values.identification_type),
               residence_country: Number(values.residence_country),
               residence_city: Number(values.residence_city),
               nationality: Number(values.nationality),
            },
            clinic.slug,
         );

         setEditedOpen(true);
      } catch (error) {
         if ((error as AxiosError).response?.status === 409) {
            setCreationError(dic.texts.errors.unavailable_mail);
         } else {
            setCreationError(dic.texts.errors.unexpected_error);
         }

         setIsLoading(false);
      }
   }

   function ButtonsGroup() {
      return (
         <div className="grid gap-5 justify-self-end md:w-max md:grid-cols-2">
            {creationError && (
               <div className="w-full flex-none text-center text-error md:col-span-2 md:text-end lg:text-end">
                  {creationError}
               </div>
            )}
            <Button
               className="lg:w-max lg:!px-16"
               isDisabled={isLoading}
               onPress={() => setClosingOpen(true)}
               variant={Variant.secondary}
            >
               {dic.texts.flows.cancel}
            </Button>
            <Button
               onPress={() => {
                  setErrors(undefined);
                  const valuesParsing = valuesSchema.safeParse(values);
                  valuesParsing.success
                     ? send()
                     : setErrors(valuesParsing.error.errors);
               }}
               isDisabled={isLoading}
               className="flex items-center justify-center gap-2 justify-self-end lg:w-max lg:!px-16"
            >
               {isLoading ? (
                  <>
                     {dic.texts.flows.loading}...
                     <RefreshRoundedIcon className="animate-spin" />
                  </>
               ) : (
                  dic.texts.flows.save
               )}
            </Button>
         </div>
      );
   }

   async function imageInputHandler(e: ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.item(0);

      setNewImage(() => {
         if (file) {
            if (file.size > 10000000) {
               return dic.texts.errors.size_larger;
            } else if (
               file.type === 'image/png' ||
               file.type === 'image/jpg' ||
               file.type === 'image/jpeg'
            ) {
               return file;
            } else {
               return dic.texts.errors.type_invalid;
            }
         }
      });
   }

   const imageUrl = useMemo(() => {
      if (newImage && typeof newImage !== 'string') {
         return URL.createObjectURL(newImage);
      } else {
         return user.profile_picture.length
            ? user.profile_picture
            : '/default_profile_picture.svg';
      }
   }, [newImage, user.profile_picture]);

   return (
      <>
         <SuccessModal isOpen={editedOpen} slug={slug} />
         <CancelConfirmationModal
            isOpen={closingOpen}
            setIsOpen={setClosingOpen}
            route={clinicRoutes(slug).patient_profile_personal_data}
         />
         <div className="text-sm lg:text-base">
            <PasswordFormModal
               isOpen={openChangePassword}
               setIsOpen={setOpenChangePassword}
            />
            <div className="grid w-full gap-14 sm:grid-cols-[2fr_4fr] lg:grid-cols-1 xl:grid-cols-[1fr_3fr]">
               <div className="mx-10 flex flex-col items-center gap-5">
                  <div className="relative aspect-square h-max w-1/2 sm:w-full lg:w-1/3 xl:w-full">
                     <Image
                        src={imageUrl}
                        alt="profile picture"
                        className="rounded-full object-cover object-center"
                        fill
                     />
                  </div>
                  <h2 className="w-full truncate text-center text-base font-semibold lg:text-lg">
                     {cutFullName(user.names, user.last_names)}
                  </h2>
                  <MinimalImageInput
                     className="w-full max-w-[10rem]"
                     inputFileRef={inputFileRef}
                     imageInputHandler={imageInputHandler}
                     file={newImage}
                  />
               </div>
               <div className="grid h-max gap-10">
                  <div className="flex w-full justify-between gap-10">
                     <h3 className="text-lg lg:text-xl">
                        {dic.texts.flows.personal_data}
                     </h3>
                     <div className="hidden w-max md:block">
                        <ButtonsGroup />
                     </div>
                  </div>
                  <section className="grid gap-5 md:grid-cols-2">
                     <TextField
                        label={dic.texts.users.name}
                        value={user.names ?? dic.texts.attributes.empty}
                        isDisabled
                     />
                     <TextField
                        label={dic.texts.users.last_names}
                        value={user.last_names ?? dic.texts.attributes.empty}
                        isDisabled
                     />
                     <TextField
                        label={dic.texts.users.birth_date}
                        value={
                           user.birth_date
                              ? (date =>
                                   `${date.getDate()}/${
                                      date.getMonth() + 1
                                   }/${date.getFullYear()}`)(
                                   new Date(user.birth_date),
                                )
                              : dic.texts.attributes.empty
                        }
                        isDisabled
                     />
                     <TextField
                        label={dic.texts.users.age}
                        value={
                           user.birth_date
                              ? makeNegativeNumberZero(
                                   (date =>
                                      todayDate.toDate(timezone).getFullYear() -
                                      date.getFullYear() -
                                      (todayDate.toDate(timezone).getMonth() <
                                      date.getMonth()
                                         ? 0
                                         : 1))(new Date(user.birth_date)),
                                ).toString()
                              : dic.texts.attributes.empty
                        }
                        isDisabled
                     />
                     <TextField
                        label={dic.texts.users.sex}
                        value={
                           user.genre
                              ? translateGenre(user.genre)
                              : dic.texts.attributes.empty
                        }
                        isDisabled
                     />
                     <TextField
                        label={dic.texts.users.nationality}
                        value={
                           nationalities.find(
                              ({ id }) => id === user.nationality,
                           )?.display_name ?? dic.texts.attributes.empty
                        }
                        isDisabled
                     />
                     <TextField
                        label={dic.texts.users.identification_type}
                        value={
                           identification_types.find(
                              ({ id }) => id === user.identification_type,
                           )?.display_name ?? dic.texts.attributes.empty
                        }
                        isDisabled
                     />
                     <TextField
                        label={dic.texts.users.identification_number}
                        value={
                           user.identification ?? dic.texts.attributes.empty
                        }
                        isDisabled
                     />
                  </section>
                  <h3 className="text-lg lg:text-xl">
                     {dic.texts.flows.contact_data}
                  </h3>
                  <section className="grid gap-5 md:grid-cols-2">
                     <TextField
                        label={dic.texts.users.email}
                        isDisabled
                        value={values.email}
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
                        label={dic.texts.users.residence_country}
                        placeholder={dic.inputs.select_country}
                        selectedKey={values.residence_country.toString()}
                        errorMessage={
                           errors?.find(
                              error => error.path[0] === 'residence_country',
                           )?.message
                        }
                        onSelectionChange={val => {
                           val &&
                              setValues(prev => ({
                                 ...prev,
                                 residence_country: val.toString(),
                                 residence_city: '',
                                 identification_type: '',
                              }));
                        }}
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
                     <div className="col-span-full">
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
                     </div>
                  </section>
                  <h3 className="text-lg lg:text-xl">
                     {dic.texts.flows.login_and_security}
                  </h3>
                  <section className="grid items-center gap-2 sm:grid-cols-[2fr_1fr]">
                     <h3 className="text-base font-semibold lg:text-lg">
                        {dic.texts.users.password}
                     </h3>
                     <Button
                        variant={Variant.secondary}
                        onPress={() => setOpenChangePassword(true)}
                        className="ml-auto flex items-center justify-center gap-2"
                     >
                        <CreateIcon />
                        {dic.texts.flows.change_password}
                     </Button>
                  </section>
                  <section className="md:hidden">
                     <ButtonsGroup />
                  </section>
               </div>
            </div>
         </div>
      </>
   );
}

function SuccessModal({ slug, isOpen }: { slug: string; isOpen: boolean }) {
   const dic = useDictionary();

   const router = useRouter();

   return (
      <ModalTrigger
         className="m-2 animate-appear text-sm sm:m-8 lg:text-base"
         isOpen={isOpen}
      >
         {() => (
            <Dialog className="flex flex-col items-center gap-9 rounded-xl p-8 sm:p-14">
               <CheckCircleRoundedIcon className="!text-7xl text-primary lg:!text-8xl" />
               <div>
                  <h3 className="mb-3 text-center text-base lg:text-xl">
                     {dic.texts.various.changes_saved}
                  </h3>
                  <p className="text-center  !font-normal text-on-background-text">
                     {dic.texts.various.see_changes_on_profile}
                  </p>
               </div>
               <Button
                  onPress={() => {
                     router.refresh();
                     router.push(
                        clinicRoutes(slug).patient_profile_personal_data,
                     );
                  }}
               >
                  {dic.texts.flows.understood}
               </Button>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
