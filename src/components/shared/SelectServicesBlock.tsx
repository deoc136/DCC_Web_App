'use client';

import Card from '@/components/shared/cards/Card';
import { AppointmentPackagesInfo } from '../../app/[slug]/receptionist/appointments/actives/create/package/views/CreationView';
import { Dispatch, SetStateAction, useEffect } from 'react';
import SelectServicesRow from './SelectServicesRow';
import { TherapistWithSchedule } from '@/types/user';
import { Appointment } from '@/types/appointment';
import { ZodIssue } from 'zod';

interface ISelectServicesBlock {
   values: AppointmentPackagesInfo;
   setValues: Dispatch<SetStateAction<AppointmentPackagesInfo>>;
   therapists: TherapistWithSchedule[];
   appointments: Appointment[];
   newPatient: boolean;
   errors: ZodIssue[] | undefined;
}

export default function SelectServicesBlock({
   values,
   setValues,
   therapists,
   appointments,
   newPatient,
   errors,
}: ISelectServicesBlock) {
   return (
      <>
         {!values.services.length ? (
            <p className="px-4 py-3 text-on-background-text">
               Selecciona un paquete para agendar
            </p>
         ) : (
            values.services.map((service, i) => (
               <SelectServicesRow
                  key={i}
                  index={i}
                  newPatient={newPatient}
                  service={service}
                  values={values}
                  therapists={therapists}
                  appointments={appointments}
                  errors={errors?.filter(
                     error =>
                        error.path.at(0) === 'services' &&
                        error.path.at(1) === i,
                  )}
                  setService={service =>
                     setValues(prev => {
                        const aux = { ...prev };

                        aux.services[i] = { ...service };

                        return aux;
                     })
                  }
               />
            ))
         )}
      </>
   );
}
