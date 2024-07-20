'use client';

import { Dispatch, SetStateAction } from 'react';
import { Values } from '../values';
import Image from 'next/image';
import PopoverTrigger from '@/components/shared/PopoverTrigger';
import Dialog from '@/components/modal/Dialog';
import { ListBox } from '@/components/shared/ListBox';
import { Item } from 'react-stately';
import CircleRoundedIcon from '@mui/icons-material/Circle';
import CircleOutlinedRoundedIcon from '@mui/icons-material/CircleOutlined';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import UserOverviewCard from '@/components/shared/cards/AdminOverviewCard';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import Headquarter from '@/components/shared/cards/Headquarter';
import usePhoneCode from '@/lib/hooks/usePhoneCode';

interface IClinicPreview {
   valuesState: [Values, Dispatch<SetStateAction<Values>>];
}

export default function ClinicPreview({ valuesState }: IClinicPreview) {
   const [values, setValues] = valuesState;

   const { cities, countries, identification_types, phone_codes } =
      useAppSelector(store => store.catalogues);

   const code = usePhoneCode();

   return (
      <div className="mb-12 grid gap-10">
         <section className="flex gap-5">
            <div className="relative aspect-video w-32 overflow-hidden">
               <Image
                  className="object-contain"
                  alt="clinic image"
                  fill
                  src={(() => {
                     const img = values.image;
                     if (img && typeof img !== 'string') {
                        return URL.createObjectURL(img);
                     } else {
                        return '';
                     }
                  })()}
               />
            </div>
            <div className="flex flex-col justify-center gap-3">
               <h2 className="font-semibold">{values.name}</h2>
               <PopoverTrigger
                  trigger={
                     <div
                        className={`flex w-max justify-end gap-2 rounded-md !bg-foundation p-3 font-normal !text-black ${
                           !values.active && '!text-on-background-disabled'
                        }`}
                     >
                        {values.active ? (
                           <>
                              <CircleRoundedIcon className="!fill-success" />
                              Activo
                           </>
                        ) : (
                           <>
                              <CircleOutlinedRoundedIcon />
                              Inactivo
                           </>
                        )}
                        <ArrowDropDownRoundedIcon className="!fill-on-background-text" />
                     </div>
                  }
               >
                  <Dialog className="rounded">
                     <ListBox className="right-0 !p-0 shadow-xl">
                        {values.active ? (
                           <Item textValue="Desactivar">
                              <button
                                 onClick={() =>
                                    setValues(prev => ({
                                       ...prev,
                                       active: false,
                                    }))
                                 }
                                 className="w-full p-3 text-start"
                              >
                                 Desactivar
                              </button>
                           </Item>
                        ) : (
                           <Item textValue="Activar">
                              <button
                                 onClick={() =>
                                    setValues(prev => ({
                                       ...prev,
                                       active: true,
                                    }))
                                 }
                                 className="w-full p-3 text-start"
                              >
                                 Activar
                              </button>
                           </Item>
                        )}
                     </ListBox>
                  </Dialog>
               </PopoverTrigger>
            </div>
         </section>
         <h3 className="text-xl">Datos Generales</h3>
         <section className="mx-24 grid grid-cols-2 gap-5">
            <div>
               <p className="mb-2 font-semibold">País</p>
               <p className="text-on-background-text">
                  {
                     countries.find(
                        country => country.id.toString() === values.country,
                     )?.name
                  }
               </p>
            </div>
            <div>
               <p className="mb-2 font-semibold">Pagina Web</p>
               <p className="text-on-background-text">{values.webPage}</p>
            </div>
            <div>
               <p className="mb-2 font-semibold">Tipo de identificación</p>
               <p className="text-on-background-text">
                  {
                     identification_types.find(
                        type => type.id.toString() === values.documentType,
                     )?.name
                  }
               </p>
            </div>
            <div>
               <p className="mb-2 font-semibold">Número de identificación</p>
               <p className="text-on-background-text">{values.document}</p>
            </div>
         </section>
         <h3 className="text-xl">Datos de contacto</h3>
         <section className="mx-24 grid gap-10">
            {values.headquarters.map(headquarter => (
               <Headquarter
                  key={headquarter.index}
                  cities={cities}
                  code={code}
                  headquarter={{
                     address: headquarter.address,
                     city: Number(headquarter.city),
                     index: headquarter.index,
                     name: headquarter.name,
                     phone: headquarter.phoneNumber,
                     removed: headquarter.removed,
                  }}
               />
            ))}
         </section>
         <h3 className="text-xl">
            Datos del Administrador Master de la clínica
         </h3>
         <section className="mx-24">
            <UserOverviewCard code={code} admin={values.administrator} />
         </section>
      </div>
   );
}
