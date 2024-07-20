'use client';

import Button, { Variant } from '@/components/shared/Button';
import ServicePackage from '@/components/shared/ServicePackage';
import useClinicCurrency from '@/lib/hooks/useClinicCurrency';
import { formatPrice, secondsToTimeExtended } from '@/lib/utils';
import { AddRounded } from '@mui/icons-material';
import { Dispatch, SetStateAction, useMemo } from 'react';
import { ServiceType } from './CreationView';
import Image from 'next/image';

interface IServicePreview {
   values: ServiceType;
   packages: NewPackage[];
   setCreatingPackage: Dispatch<SetStateAction<boolean>>;
   setEditingPackage: Dispatch<SetStateAction<number | undefined>>;
   setDeletingPackage: Dispatch<SetStateAction<number | undefined>>;
}

export default function ServicePreview({
   values,
   packages,
   setCreatingPackage,
   setDeletingPackage,
   setEditingPackage,
}: IServicePreview) {
   const clinicCurrency = useClinicCurrency();

   const imageUrl = useMemo(() => {
      if (values.image && typeof values.image !== 'string') {
         return URL.createObjectURL(values.image);
      } else {
         return '/default_service_image.png';
      }
   }, [values.image]);

   return (
      <div className="grid gap-10">
         <h2 className="font-semibold">{values.name}</h2>
         <section className="mx-24 grid grid-cols-[1fr_2fr] gap-5">
            <div className="relative aspect-[3/2] overflow-hidden rounded-lg">
               <Image
                  className="object-contain object-center"
                  fill
                  alt="service image"
                  src={imageUrl}
               />
            </div>
            <div className="grid h-min gap-5">
               <div>
                  <p className="mb-2 font-semibold">Precio</p>
                  <p className="text-on-background-text">
                     {formatPrice(Number(values.price), clinicCurrency)}
                  </p>
               </div>
               <div className="grid grid-cols-2">
                  <div>
                     <p className="mb-2 font-semibold">Duración de la sesión</p>
                     <p className="text-on-background-text">
                        {secondsToTimeExtended(Number(values.service_duration))}
                     </p>
                  </div>
                  {values.has_pause && values.pause_duration && (
                     <div>
                        <p className="mb-2 font-semibold">
                           Tiempo entre sesiones
                        </p>
                        <p className="text-on-background-text">
                           {secondsToTimeExtended(
                              Number(values.pause_duration),
                           )}
                        </p>
                     </div>
                  )}
               </div>
            </div>
            <div className="col-span-full">
               <p className="mb-2 font-semibold">Descripción del servicio</p>
               <p className="text-on-background-text">{values.description}</p>
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
            className={`mx-20 mb-10 grid gap-5 ${
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
