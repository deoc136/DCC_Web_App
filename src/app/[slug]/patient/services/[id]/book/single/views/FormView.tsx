'use client';

import ComboBox from '@/components/inputs/ComboBox';
import { NewAppointmentWithDate } from './CreationView';
import {
   Dispatch,
   SetStateAction,
   useEffect,
   useMemo,
   useState,
   useTransition,
} from 'react';
import { z } from 'zod';
import { Headquarter } from '@/types/headquarter';
import { TherapistWithSchedule, User, UserService } from '@/types/user';
import { Appointment } from '@/types/appointment';
import { Service } from '@/types/service';
import { Item } from 'react-stately';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import usePhoneCode from '@/lib/hooks/usePhoneCode';
import Button, { Variant } from '@/components/shared/Button';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import Image from 'next/image';
import { cutFullName, isSameDay, timezone, translateRole } from '@/lib/utils';
import DatePicker from '@/components/inputs/DatePicker';
import { today } from '@internationalized/date';
import HourSelector from '../components/HourSelector';
import Calendar from '@/components/calendar/Calendar';
import Card from '@/components/shared/cards/Card';
import TherapistOverviewCard from '../../components/TherapistOverviewCard';
import useDictionary from '@/lib/hooks/useDictionary';

interface IFormView {
   values: NewAppointmentWithDate;
   setValues: Dispatch<SetStateAction<NewAppointmentWithDate>>;
   errors: z.ZodIssue[] | undefined;
   headquarters: Headquarter[];
   therapists: TherapistWithSchedule[];
   userServices: UserService[];
   appointments: Appointment[];
   setRandomTherapist: Dispatch<SetStateAction<string | undefined>>;
   service: Service;
   patient: User | null;
}

export default function FormView({
   appointments,
   errors,
   headquarters,
   setRandomTherapist,
   setValues,
   therapists,
   userServices,
   values,
   service,
   patient,
}: IFormView) {
   const dic = useDictionary();

   const [cardTherapist, setCardTherapist] = useState(!!values.therapist_id);

   const [_, startTransition] = useTransition();
   const phoneCode = usePhoneCode();

   const filteredTherapists = useMemo(() => {
      const aux = userServices.filter(
         ({ service_id }) => service_id.toString() === service.id.toString(),
      );

      return therapists.filter(({ user: { id } }) =>
         aux.some(({ user_id }) => id === user_id),
      );
   }, [userServices, therapists, service.id]);

   const selectedTherapist = useMemo(
      () =>
         filteredTherapists.find(
            ({ user: { id } }) => id.toString() === values.therapist_id,
         ),
      [values.therapist_id, filteredTherapists],
   );

   useEffect(() => {
      values.therapist_id === '-1' &&
         startTransition(() =>
            setRandomTherapist(
               filteredTherapists
                  .filter(
                     ({ user: { headquarter_id } }) =>
                        headquarter_id?.toString() === values.headquarter_id,
                  )
                  .find(({ schedules, user }) =>
                     schedules.some(
                        ({ hour_ranges, days }) =>
                           hour_ranges.some(
                              ({ start_hour, end_hour }) =>
                                 Number(values.hour) >= Number(start_hour) &&
                                 Number(values.hour) <= Number(end_hour),
                           ) &&
                           days.some(
                              ({ day }) =>
                                 (day === 7 ? 0 : day) ===
                                 values.date?.toDate(timezone).getDay(),
                           ) &&
                           !appointments.some(
                              ({ date, hour, therapist_id }) =>
                                 therapist_id === user.id &&
                                 isSameDay(
                                    values.date.toDate(timezone),
                                    new Date(date),
                                 ) &&
                                 hour.toString() === values.hour.toString(),
                           ),
                     ),
                  )
                  ?.user.id.toString(),
            ),
         );
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [values.hour]);

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
            <div>
               {cardTherapist && selectedTherapist ? (
                  <>
                     <p className="mb-2 font-semibold text-on-background-text">
                        {dic.texts.attributes.therapist}
                     </p>
                     <TherapistOverviewCard
                        user={selectedTherapist.user}
                        code={phoneCode}
                        extra={
                           <Button
                              className="!bg-transparent !p-0"
                              aria-label="change therapist"
                              onPress={() => setCardTherapist(false)}
                           >
                              <ChevronRightRoundedIcon className="!rotate-90 !fill-on-background-text" />
                           </Button>
                        }
                     />
                  </>
               ) : (
                  <ComboBox
                     isDisabled={!values.headquarter_id.length}
                     placeholder={dic.inputs.select_therapist}
                     label={dic.texts.attributes.therapist}
                     selectedKey={values.therapist_id?.toString()}
                     onSelectionChange={val => {
                        if (val) {
                           setValues(prev => ({
                              ...prev,
                              therapist_id: val.toString(),
                              hour: '',
                           }));
                           setCardTherapist(true);
                        }
                     }}
                     errorMessage={
                        errors?.find(
                           error => error.path.at(0) === 'therapist_id',
                        )?.message
                     }
                  >
                     {[
                        <Item key="-1" textValue={dic.inputs.any_therapist}>
                           <div className="flex w-full items-center gap-3 px-4 py-3 text-on-background-text hover:bg-primary-100">
                              <ShuffleRoundedIcon className="!fill-on-background-light" />
                              <div>
                                 <p className="text-lg">
                                    {dic.inputs.any_therapist}
                                 </p>
                              </div>
                           </div>
                        </Item>,
                        ...filteredTherapists
                           .filter(
                              ({
                                 user: { headquarter_id, enabled, retired },
                              }) =>
                                 !retired &&
                                 enabled &&
                                 headquarter_id?.toString() ===
                                    values.headquarter_id,
                           )
                           .map(({ user }) => (
                              <Item
                                 key={user.id}
                                 textValue={cutFullName(
                                    user.names,
                                    user.last_names,
                                 )}
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
                                          alt="profile picture"
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
               )}
            </div>
         </section>
         <div>
            <h2 className="mb-3 text-base font-semibold">
               {dic.texts.various.available_dates}
            </h2>
            <p className="text-on-background-text">
               {
                  dic.pages.patient.services.book.step_1
                     .available_dates_description
               }
            </p>
         </div>
         <section className="grid gap-5 md:hidden">
            <DatePicker
               label={dic.texts.attributes.date}
               isDisabled={!values.therapist_id.length}
               errorMessage={
                  errors?.find(error => error.path.at(0) === 'date')?.message
               }
               isDateUnavailable={date =>
                  values.therapist_id === '-1'
                     ? !filteredTherapists
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
               value={values.date}
               onChange={val => {
                  val &&
                     setValues(prev => ({
                        ...prev,
                        date: val,
                        hour: '',
                     }));
               }}
            />
            <div>
               <HourSelectorComponent
                  appointments={appointments}
                  filteredTherapists={filteredTherapists}
                  patient={patient}
                  selectedTherapist={selectedTherapist}
                  setValues={setValues}
                  values={values}
               />
               {(message =>
                  message && <div className="mt-4 text-error">{message}</div>)(
                  errors?.find(error => error.path.at(0) === 'hour')?.message,
               )}
            </div>
         </section>
         <section className="hidden grid-cols-7 gap-5 md:grid lg:grid-cols-5 xl:grid-cols-3">
            <Card className="col-span-3 flex h-max flex-col gap-5 !p-0 lg:col-span-2 xl:col-end-1">
               <Calendar
                  isDisabled={!values.therapist_id.length}
                  errorMessage={
                     errors?.find(error => error.path.at(0) === 'date')?.message
                  }
                  isDateUnavailable={date =>
                     values.therapist_id === '-1'
                        ? !filteredTherapists
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
                  value={values.date}
                  onChange={val => {
                     val &&
                        setValues(prev => ({
                           ...prev,
                           date: val,
                           hour: '',
                        }));
                  }}
               />
               {(message =>
                  message && <div className="mt-4 text-error">{message}</div>)(
                  errors?.find(error => error.path.at(0) === 'date')?.message,
               )}
            </Card>
            <Card className="col-span-full col-start-4 flex flex-col justify-between gap-5 lg:col-span-full lg:col-start-3 xl:col-span-full xl:col-start-1">
               <HourSelectorComponent
                  appointments={appointments}
                  filteredTherapists={filteredTherapists}
                  patient={patient}
                  selectedTherapist={selectedTherapist}
                  setValues={setValues}
                  values={values}
               />
               {(message =>
                  message && <div className="mt-4 text-error">{message}</div>)(
                  errors?.find(error => error.path.at(0) === 'hour')?.message,
               )}
            </Card>
         </section>
      </>
   );
}

interface IHourSelector {
   values: NewAppointmentWithDate;
   setValues: Dispatch<SetStateAction<NewAppointmentWithDate>>;
   filteredTherapists: TherapistWithSchedule[];
   selectedTherapist: TherapistWithSchedule | undefined;
   appointments: Appointment[];
   patient: User | null;
}

function HourSelectorComponent({
   appointments,
   values,
   setValues,
   patient,
   filteredTherapists,
   selectedTherapist,
}: IHourSelector) {
   const dic = useDictionary();

   const hours = useAppSelector(store => store.catalogues.hours);

   return (
      <div>
         <p className="mb-2 font-semibold text-on-background-text lg:mb-5">
            {dic.texts.various.available_hours}
         </p>
         {(() => {
            const filteredHours = [...hours].filter(
               ({ code }) =>
                  (isSameDay(values.date.toDate(timezone), new Date())
                     ? Number(code) > new Date().getHours()
                     : true) &&
                  !appointments.some(
                     ({ date, hour, patient_id }) =>
                        patient_id.toString() === patient?.id.toString() &&
                        isSameDay(
                           values.date.toDate(timezone),
                           new Date(date),
                        ) &&
                        hour.toString() === code.toString(),
                  ) &&
                  (values.therapist_id === '-1'
                     ? filteredTherapists
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
                                         Number(code) >= Number(start_hour) &&
                                         Number(code) <= Number(end_hour),
                                   ) &&
                                   days.some(
                                      ({ day }) =>
                                         (day === 7 ? 0 : day) ===
                                         values.date?.toDate(timezone).getDay(),
                                   ) &&
                                   !appointments.some(
                                      ({ date, hour, therapist_id }) =>
                                         therapist_id === user.id &&
                                         isSameDay(
                                            values.date.toDate(timezone),
                                            new Date(date),
                                         ) &&
                                         hour.toString() === code.toString(),
                                   ),
                             ),
                          )
                     : !appointments.some(
                          ({ date, hour, therapist_id }) =>
                             therapist_id.toString() === values.therapist_id &&
                             isSameDay(
                                values.date.toDate(timezone),
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
                                   values.date?.toDate(timezone).getDay(),
                             ),
                       )),
            );

            return !!filteredHours.length ? (
               <HourSelector
                  setHour={code => setValues(prev => ({ ...prev, hour: code }))}
                  selectedHour={values.hour}
                  filteredHours={filteredHours}
               />
            ) : (
               <p className="my-20 text-center">
                  {dic.texts.various.no_available_hours}
               </p>
            );
         })()}
      </div>
   );
}
