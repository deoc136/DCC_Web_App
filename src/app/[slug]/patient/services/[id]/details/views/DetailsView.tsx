'use client';

import { changeTitle } from '@/lib/features/title/title_slice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux-hooks';
import { clinicRoutes } from '@/lib/routes';
import { secondsToTimeExtended } from '@/lib/utils';
import { Service } from '@/types/service';
import Image from 'next/image';
import SessionCard from '../components/SessionCard';
import useDictionary from '@/lib/hooks/useDictionary';

interface IDetailsView {
   service: Service;
   packages: Package[];
}

export default function DetailsView({ service, packages }: IDetailsView) {
   const dic = useDictionary();

   const dispatch = useAppDispatch();

   const { slug } = useAppSelector(store => store.clinic);

   dispatch(
      changeTitle({
         goBackRoute: clinicRoutes(slug).patient_services,
         value: `${dic.texts.services.services} / ${dic.texts.services.service_details}`,
      }),
   );

   return (
      <>
         <div className="mb-10 grid gap-5 text-sm sm:grid-cols-2 lg:grid-cols-3 lg:text-base">
            <div className="relative aspect-[350/254] w-full overflow-hidden rounded-lg">
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
            <div className="grid h-max gap-5 lg:col-start-2 lg:col-end-4">
               <h1 className="text-base font-semibold">{service.name}</h1>
               <div>
                  <p className="mb-2 font-semibold">
                     {dic.texts.attributes.description}
                  </p>
                  <p className="text-on-background-text">
                     {service.description}
                  </p>
               </div>
               <div>
                  <p className="mb-2 font-semibold">
                     {dic.texts.attributes.duration}
                  </p>
                  <p className="text-on-background-text">
                     {secondsToTimeExtended(
                        Number(service.service_duration),
                        dic,
                     )}{' '}
                     {dic.texts.services.per_person?.toLowerCase()}
                  </p>
               </div>
            </div>
         </div>
         <div className="flex flex-col gap-x-5 gap-y-10 md:flex-row">
            <SessionCard
               price={Number(service.price)}
               title={`1 ${dic.texts.various.session?.toLowerCase()}`}
               url={
                  clinicRoutes(slug).patient_services_id(service.id).book_single
               }
            />
            {packages.map(({ id, price, description, name }) => (
               <SessionCard
                  key={id}
                  title={`Pack "${name}"`}
                  price={Number(price)}
                  url={clinicRoutes(slug).patient_services_id(id).book_package}
                  description={description}
               />
            ))}
         </div>
      </>
   );
}
