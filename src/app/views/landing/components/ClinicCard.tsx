'use client';

import { clinicRoutes } from '@/lib/routes';
import { Clinic } from '@/types/clinic';
import Image from 'next/image';
import Link from 'next/link';

interface IClinicCard {
   clinic: Clinic;
}

export default function ClinicCard({ clinic }: IClinicCard) {
   return (
      <Link
         href={clinicRoutes(clinic.slug).patient_services}
         className="grid aspect-square w-full grid-rows-[1fr_auto] gap-4 rounded-xl bg-white px-10 py-6 shadow-lg transition hover:scale-105"
      >
         <div className="relative w-full">
            <Image
               alt={`${clinic.name} logo`}
               src={clinic.profile_picture_url}
               fill
               className="object-contain"
            />
         </div>
         <p className="text-center font-semibold">{clinic.name}</p>
      </Link>
   );
}
