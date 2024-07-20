'use client';

import Button from '@/components/shared/Button';
import ServicePackage from '@/components/shared/ServicePackage';
import { formatPrice, secondsToTimeExtended } from '@/lib/utils';
import { Service } from '@/types/service';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { useMemo, useState } from 'react';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { useRouter } from 'next/navigation';
import { clinicRoutes } from '@/lib/routes';
import useClinicCurrency from '@/lib/hooks/useClinicCurrency';
import Image from 'next/image';
import { FullFilledUser } from '@/types/user';
import EmployeeCard from '@/components/shared/cards/EmployeeCard';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import usePhoneCode from '@/lib/hooks/usePhoneCode';

interface IServiceDetailsView {
   service: Service;
   packages: Package[];
   slug: string;
   id: string;
   therapists: Omit<FullFilledUser, 'services'>[];
}

export default function ServiceDetailsView({
   service,
   packages,
   slug,
   id,
   therapists,
}: IServiceDetailsView) {
   const clinicCurrency = useClinicCurrency();

   const [showPackages, setShowPackages] = useState(true);
   const [showPersonal, setShowPersonal] = useState(true);

   const code = usePhoneCode();

   return (
      <div className="grid gap-10">
         <div className="flex justify-between">
            <h2 className="font-semibold">{service.name}</h2>
            <Button
               href={clinicRoutes(slug).admin_services_id(Number(id)).edit}
               className="flex !w-max items-center gap-2"
            >
               <EditRoundedIcon />
               Editar servicio
            </Button>
         </div>
         <section className="mx-24 grid grid-cols-[1fr_2fr] gap-5">
            <div className="relative aspect-[3/2] overflow-hidden rounded-lg">
               <Image
                  className="object-cover object-center"
                  fill
                  alt="service image"
                  src={
                     service.picture_url?.length
                        ? service.picture_url
                        : '/default_service_image.png'
                  }
               />
            </div>
            <div className="grid h-min gap-5">
               <div>
                  <p className="mb-2 font-semibold">Precio</p>
                  <p className="text-on-background-text">
                     {formatPrice(Number(service.price), clinicCurrency)}
                  </p>
               </div>
               <div className="grid grid-cols-2">
                  <div>
                     <p className="mb-2 font-semibold">Duración de la sesión</p>
                     <p className="text-on-background-text">
                        {secondsToTimeExtended(
                           Number(service.service_duration),
                        )}
                     </p>
                  </div>
                  {service.has_pause && service.pause_duration && (
                     <div>
                        <p className="mb-2 font-semibold">
                           Tiempo entre sesiones
                        </p>
                        <p className="text-on-background-text">
                           {secondsToTimeExtended(
                              Number(service.pause_duration),
                           )}
                        </p>
                     </div>
                  )}
               </div>
            </div>
            <div className="col-span-full">
               <p className="mb-2 font-semibold">Descripción del servicio</p>
               <p className="text-on-background-text">{service.description}</p>
            </div>
         </section>
         <Button
            className="flex !w-full justify-between rounded-none border-b border-on-background-light !bg-transparent !p-0 !py-2 !text-start !text-black"
            onPress={() => setShowPackages(prev => !prev)}
         >
            <h2 className="font-semibold">Paquetes de servicio</h2>

            <ChevronRightRoundedIcon
               className={`box-content py-[.4rem] transition ${
                  showPackages && 'rotate-90 !fill-secondary'
               }`}
               height={16}
            />
         </Button>
         {showPackages && (
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
                        setEditingPackage={a => {}}
                        setDeletingPackage={a => {}}
                        servicePackage={$package}
                        hideSeeMore
                     />
                  ))
               ) : (
                  <p className="col-span-2 my-10 w-full text-center font-semibold">
                     No has creado ningún paquete
                  </p>
               )}
            </section>
         )}
         <Button
            className="flex !w-full justify-between rounded-none border-b border-on-background-light !bg-transparent !p-0 !py-2 !text-start !text-black"
            onPress={() => setShowPersonal(prev => !prev)}
         >
            <h2 className="font-semibold">Personal asignado</h2>

            <ChevronRightRoundedIcon
               className={`box-content py-[.4rem] transition ${
                  showPersonal && 'rotate-90 !fill-secondary'
               }`}
               height={16}
            />
         </Button>
         {showPersonal && (
            <section
               className={`mx-20 mb-10 grid gap-x-5 gap-y-10 ${
                  therapists.length > 1 && 'grid-cols-2'
               }`}
            >
               {therapists.length ? (
                  <>
                     {therapists.map(data => (
                        <EmployeeCard
                           data={data}
                           key={data.user.id}
                           url={
                              clinicRoutes(slug).admin_team_id(data.user.id)
                                 .details
                           }
                           code={code}
                        />
                     ))}
                  </>
               ) : (
                  <p className="col-span-2 my-10 w-full text-center font-semibold">
                     No se ha agregado ningún terapeuta a este servicio
                  </p>
               )}
            </section>
         )}
      </div>
   );
}
