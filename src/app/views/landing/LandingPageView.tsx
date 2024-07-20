'use client';

import { ClinicPopulated } from '@/types/clinic';
import Image from 'next/image';
import {
   CalendarTodayRounded,
   HowToRegRounded,
   TuneRounded,
   WorkspacesRounded,
} from '@mui/icons-material';
import { DetailedHTMLProps, HTMLAttributes, useState } from 'react';
import Pagination from '@/components/shared/Pagination';
import LandingHeader from './components/LandingHeader';
import ClinicCard from './components/ClinicCard';
import LandingFooter from './components/LandingFooter';

interface ILandingPageView {
   clinics: ClinicPopulated[];
}

export default function LandingPageView({ clinics }: ILandingPageView) {
   const benefits = [
      {
         Icon: TuneRounded,
         title: 'Personaliza servicios a tu manera',
         description:
            'Asigna tiempos, precios, y habilita el personal quien se encargara de operar el servicio. Crea paquetes para ofrecer las mejores ofertas para tus clientes.',
      },
      {
         Icon: CalendarTodayRounded,
         title: 'Agenda y da seguimiento a tus citas',
         description:
            'Tus clientes podrán reservar citas que aparecerán en los calendarios de tu personal médico. Ten visibilidad de todas las reservas hechas en el mes y lleva un registro en tiempo real de tus ventas.',
      },
      {
         Icon: WorkspacesRounded,
         title: 'Gestiona tu equipo de trabajo',
         description:
            'Podrás llevar registro de ingresos y salidas de tu personal.  Personaliza las condiciones laborales y da seguimiento de su desempeño según el feedback de tus clientes.',
      },
      {
         Icon: HowToRegRounded,
         title: 'Mantén el registro clínico de tus clientes/pacientes',
         description:
            'Agenda ahora te ahorra el papeleo. Registra y guarda la información de tus clientes/pacientes en el momento indicado. Encuentra rápidamente lo que estas buscando, inclusive años después de haberlos registrado.',
      },
   ];

   const [page, setPage] = useState(0);

   const limit = 8;

   return (
      <>
         <div className="w-full bg-gradient-to-b from-transparent via-primary-50 to-transparent text-sm lg:text-base">
            <LandingHeader />
            <div className="relative">
               <div className="relative z-10">
                  <Section className="relative py-16">
                     <h1 className="mb-6 text-center text-4xl font-semibold sm:text-5xl lg:text-6xl">
                        Consolida tus operaciones en <br />{' '}
                        <span className="text-secondary">un solo lugar</span>
                     </h1>
                     <p className="mb-20 text-center text-lg lg:text-xl">
                        Con Agenda ahora agilizas la operación de tus clínicas y
                        de tus pacientes, <br /> para que tu puedas enfocarte en
                        dar atención de calidad.
                     </p>
                     <div className="relative hidden aspect-video w-full sm:block">
                        <Image
                           alt="landing hero image"
                           src="/landing_hero_image.png"
                           fill
                           className="object-contain"
                        />
                     </div>
                     <div className="relative sm:hidden">
                        <div className="relative aspect-square w-full">
                           <Image
                              alt="landing hero image"
                              src="/landing_hero_desktop.png"
                              fill
                              className="object-contain"
                           />
                        </div>
                        <div className="relative aspect-square w-full">
                           <Image
                              alt="landing hero image"
                              src="/landing_hero_mobile.png"
                              fill
                              className="object-contain"
                           />
                        </div>
                     </div>
                  </Section>
                  <Section
                     id="benefits"
                     className="relative z-10 grid gap-8 py-24 lg:grid-cols-3"
                  >
                     <h2 className="row-span-full self-center text-4xl font-semibold lg:text-5xl">
                        Conoce las <br className="hidden lg:block" />{' '}
                        <span className="text-secondary">herramientas</span>{' '}
                        <br /> a tu{' '}
                        <span className="text-secondary">alcance</span>
                     </h2>
                     <div className="grid grid-rows-2 gap-12 sm:grid-cols-2 lg:col-span-2">
                        {benefits.map(({ Icon, title, description }) => (
                           <div key={title} className="grid gap-6">
                              <Icon className="!fill-secondary !text-6xl lg:!text-7xl" />
                              <p className="text-2xl font-semibold lg:text-3xl">
                                 {title}
                              </p>
                              <p>{description}</p>
                           </div>
                        ))}
                     </div>
                  </Section>
                  <Section id="affiliates" className="grid gap-16 py-20">
                     <h2 className="text-center text-4xl font-semibold lg:text-5xl">
                        Nuestras clínicas registradas
                     </h2>
                     <div className="grid grid-rows-2 gap-12 sm:grid-cols-2 lg:grid-cols-4">
                        {clinics
                           .slice(page * limit, page * limit + limit)
                           .map(({ clinic }) => (
                              <ClinicCard key={clinic.id} clinic={clinic} />
                           ))}
                     </div>
                     <Pagination
                        page={page}
                        setPage={setPage}
                        totalPages={Math.ceil(clinics.length / limit)}
                     />
                  </Section>
               </div>
               <div className="absolute inset-0 z-0 overflow-hidden">
                  <div className="absolute right-0 top-[25%] z-10 hidden aspect-square w-1/3 sm:block">
                     <Image
                        alt="background shape"
                        src="/landing_orange_circle_1.svg"
                        fill
                     />
                  </div>
                  <div className="absolute -right-[20%] top-[8%] z-0 aspect-[1652/974] w-[400%] sm:left-0 sm:top-[16%] sm:w-[110%]">
                     <Image
                        alt="background shape"
                        src="/landing_blue_waves_1.svg"
                        fill
                     />
                  </div>
                  <div className="absolute -bottom-[2%] left-0 z-0 hidden aspect-[1652/974] w-[125%] sm:block">
                     <Image
                        alt="background shape"
                        src="/landing_blue_waves_2.svg"
                        fill
                     />
                  </div>
                  <div className="absolute bottom-0 left-0 z-10 aspect-square w-full sm:w-1/3">
                     <Image
                        alt="background shape"
                        src="/landing_orange_circle_2.svg"
                        fill
                     />
                  </div>
               </div>
            </div>
            <LandingFooter />
         </div>
      </>
   );
}

function Section({
   children,
   className,
   ...props
}: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>) {
   return (
      <section
         className={`m-auto max-w-[1920px] px-8 sm:px-12 xl:px-28 ${className}`}
         {...props}
      >
         {children}
      </section>
   );
}
