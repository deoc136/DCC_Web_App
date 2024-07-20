'use client';

import ComboBox from '@/components/inputs/ComboBox';
import { NewAppointmentWithDate } from './CreationView';
import { Dispatch, SetStateAction, useMemo } from 'react';
import { z } from 'zod';
import { Headquarter } from '@/types/headquarter';
import { TherapistWithSchedule, User, UserService } from '@/types/user';
import { Appointment } from '@/types/appointment';
import { Service } from '@/types/service';
import { Item } from 'react-stately';
import Card from '@/components/shared/cards/Card';
import SelectServicesBlock from '@/components/shared/SelectServicesBlock';
import useDictionary from '@/lib/hooks/useDictionary';

interface IFormView {
   values: NewAppointmentWithDate;
   setValues: Dispatch<SetStateAction<NewAppointmentWithDate>>;
   errors: z.ZodIssue[] | undefined;
   headquarters: Headquarter[];
   therapists: TherapistWithSchedule[];
   userServices: UserService[];
   appointments: Appointment[];
   service: Service;
   patient: User | null;
   packageData: Package;
}

export default function FormView({
   appointments,
   errors,
   headquarters,
   setValues,
   therapists,
   userServices,
   values,
   service,
   patient,
   packageData,
}: IFormView) {
   const dic = useDictionary();

   const filteredTherapists = useMemo(() => {
      const aux = userServices.filter(
         ({ service_id }) => service_id.toString() === service.id.toString(),
      );

      return therapists.filter(({ user: { id } }) =>
         aux.some(({ user_id }) => id === user_id),
      );
   }, [userServices, therapists, service.id]);

   return (
      <>
         <h2 className="text-base font-semibold lg:text-lg">
            {dic.texts.services.book_your_appointment}
         </h2>
         <section className="grid gap-5 md:grid-cols-2">
            <div className="text-on-background-text md:col-span-full">
               <p className="mb-2 font-semibold">
                  {dic.texts.services.service}
               </p>
               <p>{service.name}</p>
            </div>
            <ComboBox
               placeholder={dic.inputs.select_headquarter}
               label={dic.texts.attributes.headquarter}
               selectedKey={values.headquarter_id?.toString()}
               onSelectionChange={val => {
                  val &&
                     setValues(prev => ({
                        ...prev,
                        headquarter_id: val.toString(),
                        therapist_id: '',
                     }));
               }}
               errorMessage={
                  errors?.find(error => error.path.at(0) === 'headquarter_id')
                     ?.message
               }
            >
               {headquarters
                  .sort((a, b) => a.index - b.index)
                  .filter(
                     ({ removed, id }) =>
                        !removed &&
                        filteredTherapists.some(
                           ({ user: { headquarter_id } }) =>
                              id === headquarter_id,
                        ),
                  )
                  .map((quarter, i) => (
                     <Item key={quarter.id} textValue={quarter.name}>
                        <div className="px-4 py-3 hover:bg-primary-100">
                           {quarter.name} -{' '}
                           {i > 0
                              ? `${dic.texts.attributes.headquarter} ${i + 1}`
                              : dic.texts.attributes.main_headquarter}
                        </div>
                     </Item>
                  ))}
            </ComboBox>
            <Card
               isShadowed
               className="min-h-[2rem] w-full overflow-hidden !p-0 md:col-span-2"
            >
               <SelectServicesBlock
                  therapists={filteredTherapists}
                  setValues={setValues as any}
                  values={{
                     ...values,
                     patient_id: patient?.id.toString() ?? '',
                     service_id: service.id.toString(),
                     package_id: packageData.id.toString(),
                  }}
                  appointments={appointments}
                  newPatient={false}
                  errors={errors}
               />
            </Card>
         </section>
      </>
   );
}
