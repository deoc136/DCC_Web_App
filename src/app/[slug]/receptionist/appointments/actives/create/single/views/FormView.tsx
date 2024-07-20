'use client';

import {
   Dispatch,
   SetStateAction,
   useEffect,
   useMemo,
   useState,
   useTransition,
} from 'react';
import { z } from 'zod';
import {
   NewUser,
   TherapistWithSchedule,
   User,
   UserService,
} from '@/types/user';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import ComboBox from '@/components/inputs/ComboBox';
import { Item } from 'react-stately';
import { NewAppointmentWithDate } from './CreationView';
import { Service } from '@/types/service';
import { Headquarter } from '@/types/headquarter';
import DatePicker from '@/components/inputs/DatePicker';
import { CalendarDate, CalendarDateTime, today } from '@internationalized/date';
import { cutFullName, isSameDay, timezone, translateRole } from '@/lib/utils';
import UserOverviewCard from '@/components/shared/cards/UserOverviewCard';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import Button from '@/components/shared/Button';
import Image from 'next/image';
import { Appointment, PaymentMethod } from '@/types/appointment';
import SelectPatientModal from '../../../components/SelectPatientModal';
import usePhoneCode from '@/lib/hooks/usePhoneCode';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';

interface IFormView {
   values: NewAppointmentWithDate;
   setValues: Dispatch<SetStateAction<NewAppointmentWithDate>>;
   errors: z.ZodIssue[] | undefined;
   services: Service[];
   headquarters: Headquarter[];
   therapists: TherapistWithSchedule[];
   patients: User[];
   userServices: UserService[];
   appointments: Appointment[];
   newPatient: NewUser | undefined;
   setNewPatient: Dispatch<SetStateAction<NewUser | undefined>>;
   setRandomTherapist: Dispatch<SetStateAction<string | undefined>>;
}

export type ChangeValuesFunction = <T extends keyof NewAppointmentWithDate>(
   param: T,
   value: NewAppointmentWithDate[T],
) => void;

export default function FormView({
   setValues,
   values,
   errors,
   headquarters,
   patients,
   services,
   therapists,
   userServices,
   appointments,
   newPatient,
   setNewPatient,
   setRandomTherapist,
}: IFormView) {
   function changeValues<T extends keyof typeof values>(
      param: T,
      value: (typeof values)[T],
   ) {
      setValues(prev => ({ ...prev, [param]: value }));
   }

   const { hours } = useAppSelector(store => store.catalogues);

   const [_, startTransition] = useTransition();

   const phoneCode = usePhoneCode();

   const [cardTherapist, setCardTherapist] = useState(!!values.therapist_id);

   const [patientModalOpen, setPatientModalOpen] = useState(false);

   const filteredTherapists = useMemo(() => {
      const aux = userServices.filter(
         ({ service_id }) => service_id.toString() === values.service_id,
      );

      return therapists.filter(({ user: { id } }) =>
         aux.some(({ user_id }) => id === user_id),
      );
   }, [userServices, therapists, values.service_id]);

   const selectedTherapist = useMemo(
      () =>
         filteredTherapists.find(
            ({ user: { id } }) => id.toString() === values.therapist_id,
         ),
      [values.therapist_id, filteredTherapists],
   );

   const patient = useMemo(
      () => patients.find(user => user.id.toString() === values.patient_id),
      [patients, values.patient_id],
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
         <SelectPatientModal
            newUser={newPatient}
            setNewUser={setNewPatient}
            isOpen={patientModalOpen}
            setIsOpen={setPatientModalOpen}
            selectedUserId={values.patient_id}
            users={patients}
            changeValues={id => changeValues('patient_id', id)}
         />
         <div className="mb-10 grid gap-10">
            <h2 className="font-semibold">Datos generales de la reserva</h2>
            <section className="mx-20 grid grid-cols-2 gap-5">
               <div className="col-span-2">
                  <p className="mb-2 text-on-background-text label">Paciente</p>
                  {newPatient || patient ? (
                     <UserOverviewCard
                        user={
                           newPatient
                              ? {
                                   ...newPatient,
                                }
                              : {
                                   ...patient!,
                                }
                        }
                        code={phoneCode}
                        extra={
                           <Button
                              onPress={() => setPatientModalOpen(true)}
                              className="flex w-max items-center gap-2 bg-transparent !text-secondary"
                           >
                              Cambiar
                           </Button>
                        }
                     />
                  ) : (
                     <Button
                        onPress={() => setPatientModalOpen(true)}
                        className="flex !w-full justify-center border-2 border-dashed border-on-background-light !bg-transparent !p-6 !text-on-background-text"
                     >
                        <AddRoundedIcon /> Agregar paciente
                     </Button>
                  )}

                  {(message =>
                     message && (
                        <div className="mt-4 text-error">{message}</div>
                     ))(
                     errors?.find(error => error.path.at(0) === 'patient_id')
                        ?.message,
                  )}
               </div>
               <ComboBox
                  placeholder="Selecciona un servicio"
                  label="Tipo de servicio"
                  selectedKey={values.service_id?.toString()}
                  onSelectionChange={val => {
                     if (!val) return;

                     const aux = services.find(
                        ({ id }) => id.toString() === val.toString(),
                     );
                     setValues(prev => ({
                        ...prev,
                        headquarter_id: '',
                        therapist_id: '',
                        price: aux?.price ?? '',
                        service_id: val.toString(),
                     }));
                  }}
                  errorMessage={
                     errors?.find(error => error.path.at(0) === 'service_id')
                        ?.message
                  }
               >
                  {services
                     .filter(service => service.active && !service.removed)
                     .map(type => (
                        <Item key={type.id} textValue={type.name}>
                           <div className="px-4 py-3 hover:bg-primary-100">
                              {type.name}
                           </div>
                        </Item>
                     ))}
               </ComboBox>
               <ComboBox
                  isDisabled={!values.service_id.length}
                  placeholder="Selecciona una sede"
                  label="Sede"
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
                     errors?.find(
                        error => error.path.at(0) === 'headquarter_id',
                     )?.message
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
                              {i > 0 ? `Sede ${i + 1}` : 'Sede principal'}
                           </div>
                        </Item>
                     ))}
               </ComboBox>
               <div className="col-span-2">
                  {cardTherapist && selectedTherapist ? (
                     <>
                        <p className="mb-2 text-on-background-text label">
                           Terapeuta
                        </p>
                        <UserOverviewCard
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
                        placeholder="Selecciona un terapeuta"
                        label="Terapeuta"
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
                           <Item key="-1" textValue="Cualquier terapeuta">
                              <div className="flex w-full items-center gap-3 px-4 py-3 text-on-background-text hover:bg-primary-100">
                                 <ShuffleRoundedIcon className="!fill-on-background-light" />
                                 <div>
                                    <p className="text-lg">
                                       Cualquier terapeuta
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
                                          <p>{translateRole(user.role)}</p>
                                       </div>
                                    </div>
                                 </Item>
                              )),
                        ]}
                     </ComboBox>
                  )}
               </div>
               <DatePicker
                  label="Fecha de la reserva"
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
               <ComboBox
                  isDisabled={!values.therapist_id}
                  placeholder="Selecciona un horario"
                  label="Horario de la reserva"
                  selectedKey={values.hour?.toString()}
                  onSelectionChange={val => {
                     val && changeValues('hour', val.toString());
                  }}
                  errorMessage={
                     errors?.find(error => error.path.at(0) === 'hour')?.message
                  }
               >
                  {[...hours]
                     .sort((a, b) => Number(a.code) - Number(b.code))
                     .filter(
                        ({ code }) =>
                           (isSameDay(values.date.toDate(timezone), new Date())
                              ? Number(code) > new Date().getHours()
                              : true) &&
                           (!!newPatient
                              ? true
                              : !appointments.some(
                                   ({ date, hour, patient_id }) =>
                                      patient_id.toString() ===
                                         values.patient_id &&
                                      isSameDay(
                                         values.date.toDate(timezone),
                                         new Date(date),
                                      ) &&
                                      hour.toString() === code.toString(),
                                )) &&
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
                                                  Number(code) >=
                                                     Number(start_hour) &&
                                                  Number(code) <=
                                                     Number(end_hour),
                                            ) &&
                                            days.some(
                                               ({ day }) =>
                                                  (day === 7 ? 0 : day) ===
                                                  values.date
                                                     ?.toDate(timezone)
                                                     .getDay(),
                                            ) &&
                                            !appointments.some(
                                               ({ date, hour, therapist_id }) =>
                                                  therapist_id === user.id &&
                                                  isSameDay(
                                                     values.date.toDate(
                                                        timezone,
                                                     ),
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
                                         values.therapist_id &&
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
                                            Number(code) >=
                                               Number(start_hour) &&
                                            Number(code) <= Number(end_hour),
                                      ) &&
                                      days.some(
                                         ({ day }) =>
                                            (day === 7 ? 0 : day) ===
                                            values.date
                                               ?.toDate(timezone)
                                               .getDay(),
                                      ),
                                )),
                     )
                     .map(hour => {
                        const aux = `${hour.name} - ${(hour =>
                           hour ? hour.name : '11:00 PM')(
                           hours.find(
                              ({ code }) =>
                                 Number(code) === Number(hour.code) + 1,
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
               <ComboBox
                  placeholder="Selecciona un método"
                  label="Método de pago"
                  selectedKey={values.payment_method.toString()}
                  onSelectionChange={val => {
                     val &&
                        changeValues(
                           'payment_method',
                           val.toString() as PaymentMethod,
                        );
                  }}
                  errorMessage={
                     errors?.find(
                        error => error.path.at(0) === 'payment_method',
                     )?.message
                  }
               >
                  {(
                     [
                        {
                           name: 'Pago online',
                           code: 'ONLINE',
                        },
                        {
                           name: 'Pago en efectivo',
                           code: 'CASH',
                        },
                        {
                           name: 'Pago con tarjeta',
                           code: 'CARD',
                        },
                     ] as const
                  ).map(method => (
                     <Item key={method.code} textValue={method.name}>
                        <div className="px-4 py-3 hover:bg-primary-100">
                           {method.name}
                        </div>
                     </Item>
                  ))}
               </ComboBox>
            </section>
         </div>
      </>
   );
}
