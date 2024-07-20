'use client';

import TherapistOverviewCard from '@/app/[slug]/patient/services/[id]/book/components/TherapistOverviewCard';
import HourSelector from '@/app/[slug]/patient/services/[id]/book/single/components/HourSelector';
import ComboBox from '@/components/inputs/ComboBox';
import TextField from '@/components/inputs/TextField';
import Button, { Variant } from '@/components/shared/Button';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux-hooks';
import usePhoneCode from '@/lib/hooks/usePhoneCode';
import { cutFullName, isSameDay, timezone, translateRole } from '@/lib/utils';
import { nonEmptyMessage, nonUnselectedMessage } from '@/lib/validations';
import { Appointment } from '@/types/appointment';
import { Service } from '@/types/service';
import { TherapistWithSchedule, User, UserService } from '@/types/user';
import { CalendarDate, today, DateValue } from '@internationalized/date';
import {
   Dispatch,
   SetStateAction,
   useEffect,
   useMemo,
   useState,
   useTransition,
} from 'react';
import { ZodError, z } from 'zod';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { Item } from 'react-stately';
import Image from 'next/image';
import DatePicker from '@/components/inputs/DatePicker';
import Card from '@/components/shared/cards/Card';
import Calendar from '@/components/calendar/Calendar';
import { Headquarter } from '@/types/headquarter';
import { clinicRoutes } from '@/lib/routes';
import { changeTitle } from '@/lib/features/title/title_slice';
import { editAppointment } from '@/services/appointment';
import { useRouter } from 'next/navigation';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Dialog from '@/components/modal/Dialog';
import WarningModal from '@/app/[slug]/patient/services/[id]/book/components/WarningModal';
import { sendEmail } from '@/services/messages';
import { renderToStaticMarkup } from 'react-dom/server';
import EmailLayout from '@/emails/EmailLayout';
import useDictionary from '@/lib/hooks/useDictionary';

interface IEditionView {
   service: Service;
   appointment: Appointment;
   userServices: UserService[];
   therapists: TherapistWithSchedule[];
   appointments: Appointment[];
   headquarter: Headquarter;
}

export default function EditionView({
   service,
   appointment,
   userServices,
   therapists,
   appointments,
   headquarter,
}: IEditionView) {
   const dic = useDictionary();

   const patient = useAppSelector(store => store.user);
   const clinic = useAppSelector(store => store.clinic);
   const hours = useAppSelector(store => store.catalogues.hours);

   const dispatch = useAppDispatch();

   const [values, setValues] = useState({
      ...appointment,
      therapist_id: appointment.therapist_id.toString(),
      hour: appointment.hour.toString(),
      date: (date =>
         new CalendarDate(
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate(),
         ))(new Date(appointment.date)) as DateValue,
   });

   const router = useRouter();

   const [errors, setErrors] = useState<ZodError['errors']>();
   const [randomTherapist, setRandomTherapist] = useState<string>();

   const [isEditing, setIsEditing] = useState(false);
   const [isClosing, setIsClosing] = useState(false);

   const [editionError, setEditionError] = useState<string>();

   const [edited, setEdited] = useState(false);

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
                        headquarter_id === values.headquarter_id,
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

   useEffect(() => {
      dispatch(
         changeTitle({
            goBackRoute: clinicRoutes(clinic.slug).patient_appointments_id(
               appointment.id,
            ).details,
            value: `${dic.texts.appointments.active_appointments} / ${dic.texts.appointments.appointment_details} / ${dic.texts.flows.change_date}`,
         }),
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [dispatch, dic]);

   useEffect(() => {
      const aux = new Date(appointment.date);

      aux.setHours(appointment.hour);

      const sus = aux.getTime() - new Date().getTime();

      !(sus > 0 && sus > clinic.cancelation_hours * 3600000) &&
         router.push(
            clinicRoutes(clinic.slug).patient_appointments_id(appointment.id)
               .details,
         );

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [clinic.cancelation_hours, appointment.hour, appointment.date]);

   const valuesSchema = z.object({
      date: z.unknown({ required_error: nonEmptyMessage }),
      hour: z.string().nonempty(nonUnselectedMessage),
      therapist_id: z.string().nonempty(nonUnselectedMessage),
   });

   async function edit() {
      if (isEditing) return;

      setIsEditing(true);
      setEditionError(undefined);

      try {
         await editAppointment(clinic.slug, {
            ...values,
            therapist_id:
               Number(values.therapist_id) === -1 && randomTherapist
                  ? Number(randomTherapist)
                  : Number(values.therapist_id),
            date: values.date.toDate(timezone).toString(),
            hour: Number(values.hour),
         });

         const aux = {
            date: values.date,
            hour:
               hours.find(
                  ({ code }) => code.toString() === values.hour.toString(),
               )?.code ?? '',
            prevHour:
               hours.find(
                  ({ code }) => code.toString() === appointment.hour.toString(),
               )?.code ?? '',
         };

         await sendEmail({
            content: renderToStaticMarkup(
               <EmailLayout imageUrl={clinic.profile_picture_url}>
                  <p>
                     Tu cita en {clinic.name} con motivo de {service.name} el{' '}
                     {($date =>
                        `${$date.getDate()} de ${Intl.DateTimeFormat(
                           undefined,
                           {
                              month: 'long',
                           },
                        ).format($date)} de ${$date.getFullYear()}`)(
                        new Date(appointment.date),
                     )}{' '}
                     a las{' '}
                     {hours.find(({ code }) => aux.prevHour === code)?.name} fue
                     re agendada para el{' '}
                     {($date =>
                        `${$date.getDate()} de ${Intl.DateTimeFormat(
                           undefined,
                           {
                              month: 'long',
                           },
                        ).format($date)} de ${$date.getFullYear()}`)(
                        aux.date.toDate(timezone),
                     )}{' '}
                     a las {hours.find(({ code }) => aux.hour === code)?.name}.
                  </p>
               </EmailLayout>,
            ),
            destinationEmails: patient ? [patient.email] : [],

            fromEmail: 'agenda.ahora.dvp@gmail.com',
            subject: `Reagendamiento de cita - ${clinic.name}`,
         });

         setEdited(true);
      } catch (error) {
         setEditionError(dic.texts.errors.unexpected_error);
         setIsEditing(false);
      }
   }

   return (
      <>
         <WarningModal
            cancel={() =>
               router.push(
                  clinicRoutes(clinic.slug).patient_appointments_id(
                     appointment.id,
                  ).details,
               )
            }
            isOpen={isClosing}
            setIsOpen={setIsClosing}
         />
         <SuccessModal id={appointment.id} isOpen={edited} slug={clinic.slug} />
         <div className="grid gap-10 text-sm lg:text-base xl:px-24">
            <h2 className="text-base font-semibold lg:text-lg">
               {dic.texts.appointments.change_date_and_hour}
            </h2>
            <section className="grid gap-5 md:grid-cols-2">
               <div className="text-on-background-text md:col-span-full">
                  <p className="mb-2 font-semibold">
                     {dic.texts.services.service}
                  </p>
                  <p>{service.name}</p>
               </div>
               <TextField
                  isDisabled
                  label={dic.texts.attributes.headquarter}
                  placeholder={dic.inputs.select_headquarter}
                  value={headquarter.name}
               />
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
                                    headquarter_id === values.headquarter_id,
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
                  {dic.texts.various.select_date_and_hour_large}
               </p>
            </div>
            <section className="grid gap-5 md:hidden">
               <DatePicker
                  label={dic.texts.attributes.date}
                  isDisabled={!values.therapist_id.length}
                  defaultValue={values.date}
                  errorMessage={
                     errors?.find(error => error.path.at(0) === 'date')?.message
                  }
                  isDateUnavailable={date =>
                     values.therapist_id === '-1'
                        ? !filteredTherapists
                             .filter(
                                ({ user: { headquarter_id } }) =>
                                   headquarter_id === values.headquarter_id,
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
                     message && (
                        <div className="mt-4 text-error">{message}</div>
                     ))(
                     errors?.find(error => error.path.at(0) === 'hour')
                        ?.message,
                  )}
               </div>
            </section>
            <section className="hidden grid-cols-7 gap-5 md:grid lg:grid-cols-5 xl:grid-cols-3">
               <Card className="col-span-3 flex h-max flex-col gap-5 !p-0 lg:col-span-2 xl:col-end-1">
                  <Calendar
                     isDisabled={!values.therapist_id.length}
                     errorMessage={
                        errors?.find(error => error.path.at(0) === 'date')
                           ?.message
                     }
                     isDateUnavailable={date =>
                        values.therapist_id === '-1'
                           ? !filteredTherapists
                                .filter(
                                   ({ user: { headquarter_id } }) =>
                                      headquarter_id === values.headquarter_id,
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
                     message && (
                        <div className="mt-4 text-error">{message}</div>
                     ))(
                     errors?.find(error => error.path.at(0) === 'date')
                        ?.message,
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
                     message && (
                        <div className="mt-4 text-error">{message}</div>
                     ))(
                     errors?.find(error => error.path.at(0) === 'hour')
                        ?.message,
                  )}
               </Card>
            </section>
            <div className="flex flex-col flex-wrap gap-5 lg:flex-row lg:justify-end">
               {editionError && (
                  <div className="w-full flex-none text-end text-error">
                     {editionError}
                  </div>
               )}
               <Button
                  onPress={() => {
                     if (isEditing) return;
                     setIsClosing(true);
                  }}
                  variant={Variant.secondary}
                  className="w-full bg-transparent shadow lg:w-max"
               >
                  {dic.texts.flows.cancel}
               </Button>
               <Button
                  className="flex items-center justify-center gap-2 lg:w-max lg:px-12"
                  isDisabled={isEditing}
                  onPress={() => {
                     setErrors(undefined);
                     if (isEditing) return;

                     const valuesParsing = valuesSchema.safeParse(values);

                     valuesParsing.success
                        ? edit()
                        : setErrors(valuesParsing.error.errors);
                  }}
               >
                  {isEditing ? (
                     <>
                        {dic.texts.flows.loading}...
                        <RefreshRoundedIcon className="animate-spin" />
                     </>
                  ) : (
                     dic.texts.flows.reschedule
                  )}
               </Button>
            </div>
         </div>
      </>
   );
}

interface NewAppointmentWithDate
   extends Omit<Appointment, 'date' | 'therapist_id' | 'hour'> {
   date: DateValue;
   therapist_id: string;
   hour: string;
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
            const filteredHours = [...hours]
               .sort((a, b) => Number(a.code) - Number(b.code))
               .filter(
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
                                   headquarter_id === values.headquarter_id,
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
                                            values.date
                                               ?.toDate(timezone)
                                               .getDay(),
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

function SuccessModal({
   slug,
   isOpen,
   id,
}: {
   slug: string;
   isOpen: boolean;
   id: number;
}) {
   const dic = useDictionary();

   const router = useRouter();

   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="flex flex-col items-center gap-9 rounded-xl p-8 sm:p-14">
               <CheckCircleRoundedIcon className="!text-7xl text-primary lg:!text-8xl" />
               <div>
                  <h3 className="mb-3 text-center text-base lg:text-xl">
                     {dic.pages.patient.services.book.success_modal.title}
                  </h3>
                  <p className="text-center !font-normal text-on-background-text">
                     {dic.pages.patient.services.book.success_modal.description}
                  </p>
               </div>
               <Button
                  onPress={() => {
                     router.refresh();
                     router.push(
                        clinicRoutes(slug).patient_appointments_id(id).details,
                     );
                  }}
                  className="!w-max !px-24"
               >
                  {dic.texts.flows.see_details}
               </Button>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
