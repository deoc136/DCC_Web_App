'use client';

import { useEffect, useMemo, useTransition } from 'react';
import {
   AppointmentPackagesInfo,
   ServiceOutline,
} from '../../app/[slug]/receptionist/appointments/actives/create/package/views/CreationView';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import { TherapistWithSchedule } from '@/types/user';
import { cutFullName, isSameDay, timezone, translateRole } from '@/lib/utils';
import { Appointment } from '@/types/appointment';
import ComboBox from '@/components/inputs/ComboBox';
import { Item } from 'react-stately';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import Image from 'next/image';
import DatePicker from '@/components/inputs/DatePicker';
import { today } from '@internationalized/date';
import { ZodIssue } from 'zod';
import useDictionary from '@/lib/hooks/useDictionary';

interface ISelectServicesRow {
   values: AppointmentPackagesInfo;
   service: ServiceOutline;
   therapists: TherapistWithSchedule[];
   setService: (service: ServiceOutline) => any;
   appointments: Appointment[];
   index: number;
   newPatient: boolean;
   errors: ZodIssue[] | undefined;
}

export default function SelectServicesRow({
   values,
   service,
   therapists,
   setService,
   appointments,
   index,
   newPatient,
   errors,
}: ISelectServicesRow) {
   const dic = useDictionary();

   const { hours } = useAppSelector(store => store.catalogues);

   const [_, startTransition] = useTransition();

   const selectedTherapist = useMemo(
      () =>
         therapists.find(
            ({ user: { id } }) => id.toString() === service.therapist_id,
         ),
      [service.therapist_id, therapists],
   );

   useEffect(() => {
      service.therapist_id === '-1' &&
         startTransition(() =>
            setService({
               ...service,
               random_therapist_id: therapists
                  .filter(
                     ({ user: { headquarter_id } }) =>
                        headquarter_id?.toString() === values.headquarter_id,
                  )
                  .find(({ schedules, user }) =>
                     schedules.some(
                        ({ hour_ranges, days }) =>
                           hour_ranges.some(
                              ({ start_hour, end_hour }) =>
                                 Number(service.hour) >= Number(start_hour) &&
                                 Number(service.hour) <= Number(end_hour),
                           ) &&
                           days.some(
                              ({ day }) =>
                                 (day === 7 ? 0 : day) ===
                                 service.date?.toDate(timezone).getDay(),
                           ) &&
                           !appointments.some(
                              ({ date, hour, therapist_id }) =>
                                 therapist_id === user.id &&
                                 isSameDay(
                                    service.date.toDate(timezone),
                                    new Date(date),
                                 ) &&
                                 hour.toString() === service.hour.toString(),
                           ),
                     ),
                  )
                  ?.user.id.toString(),
            }),
         );
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [service.hour]);

   return (
      <>
         <h4 className="px-4 pt-3 text-base font-semibold">
            {dic.texts.various.session} #{Number(index) + 1}
         </h4>
         <div className="grid p-3 md:grid-cols-3">
            <ComboBox
               isDisabled={!values.headquarter_id.length}
               placeholder={dic.inputs.select_therapist}
               selectedKey={service.therapist_id?.toString()}
               errorMessage={
                  errors?.find(error => error.path.at(2) === 'therapist_id')
                     ?.message
               }
               onSelectionChange={val => {
                  if (val) {
                     setService({
                        ...service,
                        therapist_id: val.toString(),
                        hour: '',
                     });
                  }
               }}
            >
               {[
                  <Item key="-1" textValue={dic.inputs.any_therapist}>
                     <div className="flex w-full items-center gap-3 px-4 py-3 text-on-background-text hover:bg-primary-100">
                        <ShuffleRoundedIcon className="!fill-on-background-light" />
                        <div>
                           <p className="text-lg">{dic.inputs.any_therapist}</p>
                        </div>
                     </div>
                  </Item>,
                  ...therapists
                     .filter(
                        ({ user: { headquarter_id, enabled, retired } }) =>
                           !retired &&
                           enabled &&
                           headquarter_id?.toString() === values.headquarter_id,
                     )
                     .map(({ user }) => (
                        <Item
                           key={user.id}
                           textValue={cutFullName(user.names, user.last_names)}
                        >
                           <div className="flex w-full gap-3 px-4 py-3 hover:bg-primary-100">
                              <div className="relative aspect-square h-max w-10 overflow-hidden rounded-full">
                                 <Image
                                    src={
                                       user.profile_picture.length
                                          ? user.profile_picture
                                          : '/default_profile_picture.svg'
                                    }
                                    className="rounded-full object-cover object-center"
                                    alt="Profile picture"
                                    fill
                                 />
                              </div>
                              <div>
                                 <p className="mb-2 text-lg font-semibold">
                                    {user.names} {user.last_names}
                                 </p>
                                 <p>{translateRole(user.role, dic)}</p>
                              </div>
                           </div>
                        </Item>
                     )),
               ]}
            </ComboBox>
            <DatePicker
               isDisabled={!service.therapist_id.length}
               isDateUnavailable={date =>
                  service.therapist_id === '-1'
                     ? !therapists
                          .filter(
                             ({ user: { headquarter_id } }) =>
                                headquarter_id?.toString() ===
                                values.headquarter_id,
                          )
                          .some(({ schedules }) =>
                             schedules.some(({ days }) =>
                                days.some(
                                   ({ day }) =>
                                      day ===
                                      (day => (day === 0 ? 7 : day))(
                                         date.toDate(timezone).getDay(),
                                      ),
                                ),
                             ),
                          )
                     : !selectedTherapist?.schedules.some(({ days }) =>
                          days.some(
                             ({ day }) =>
                                day ===
                                (day => (day === 0 ? 7 : day))(
                                   date.toDate(timezone).getDay(),
                                ),
                          ),
                       )
               }
               minValue={today(timezone)}
               value={service.date}
               onChange={val => {
                  val &&
                     setService({
                        ...service,
                        date: val,
                        hour: '',
                     });
               }}
            />
            <ComboBox
               isDisabled={!service.therapist_id}
               placeholder={dic.inputs.select_schedule}
               selectedKey={service.hour.toString()}
               onSelectionChange={val => {
                  val && setService({ ...service, hour: val.toString() });
               }}
               errorMessage={
                  errors?.find(error => error.path.at(2) === 'hour')?.message
               }
            >
               {[...hours]
                  .sort((a, b) => Number(a.code) - Number(b.code))
                  .filter(
                     ({ code }) =>
                        !values.services.some(
                           ({ date, hour }, i) =>
                              date.compare(service.date) === 0 &&
                              hour === code &&
                              i !== index,
                        ) &&
                        (isSameDay(service.date.toDate(timezone), new Date())
                           ? Number(code) > new Date().getHours()
                           : true) &&
                        (!!newPatient
                           ? true
                           : !appointments.some(
                                ({ date, hour, patient_id }) =>
                                   patient_id.toString() ===
                                      values.patient_id &&
                                   isSameDay(
                                      service.date.toDate(timezone),
                                      new Date(date),
                                   ) &&
                                   hour.toString() === code.toString(),
                             )) &&
                        (service.therapist_id === '-1'
                           ? therapists
                                .filter(
                                   ({ user: { headquarter_id } }) =>
                                      headquarter_id?.toString() ===
                                      values.headquarter_id,
                                )
                                .some(({ schedules, user }) =>
                                   schedules.some(
                                      ({ hour_ranges, days }) =>
                                         hour_ranges.some(
                                            ({ start_hour, end_hour }) =>
                                               Number(code) >=
                                                  Number(start_hour) &&
                                               Number(code) <= Number(end_hour),
                                         ) &&
                                         days.some(
                                            ({ day }) =>
                                               (day === 7 ? 0 : day) ===
                                               service.date
                                                  ?.toDate(timezone)
                                                  .getDay(),
                                         ) &&
                                         !appointments.some(
                                            ({ date, hour, therapist_id }) =>
                                               therapist_id === user.id &&
                                               isSameDay(
                                                  service.date.toDate(timezone),
                                                  new Date(date),
                                               ) &&
                                               hour.toString() ===
                                                  code.toString(),
                                         ),
                                   ),
                                )
                           : !appointments.some(
                                ({ date, hour, therapist_id }) =>
                                   therapist_id.toString() ===
                                      service.therapist_id &&
                                   isSameDay(
                                      service.date.toDate(timezone),
                                      new Date(date),
                                   ) &&
                                   hour.toString() === code.toString(),
                             ) &&
                             selectedTherapist?.schedules.some(
                                ({ hour_ranges, days }) =>
                                   hour_ranges.some(
                                      ({ start_hour, end_hour }) =>
                                         Number(code) >= Number(start_hour) &&
                                         Number(code) <= Number(end_hour),
                                   ) &&
                                   days.some(
                                      ({ day }) =>
                                         (day === 7 ? 0 : day) ===
                                         service.date
                                            ?.toDate(timezone)
                                            .getDay(),
                                   ),
                             )),
                  )
                  .map(hour => {
                     const aux = `${hour.name} - ${(hour =>
                        hour ? hour.name : '11:00 PM')(
                        hours.find(
                           ({ code }) => Number(code) === Number(hour.code) + 1,
                        ),
                     )}`;
                     return (
                        <Item key={hour.code} textValue={aux}>
                           <div className="px-4 py-3 hover:bg-primary-100">
                              {aux}
                           </div>
                        </Item>
                     );
                  })}
            </ComboBox>
         </div>
         <hr />
      </>
   );
}
