'use client';

import AppointmentStateChip from '@/components/shared/AppointmentStateChip';
import Button, { Variant } from '@/components/shared/Button';
import UserOverviewCard from '@/components/shared/cards/UserOverviewCard';
import SubmittedFormsTable from '@/components/shared/tables/SubmittedFormsTable';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import useClinicCurrency from '@/lib/hooks/useClinicCurrency';
import usePhoneCode from '@/lib/hooks/usePhoneCode';
import { cutFullName, formatPrice, isSameDay, timezone, translateRole } from '@/lib/utils';
import { Appointment } from '@/types/appointment';
import { Headquarter } from '@/types/headquarter';
import { Service } from '@/types/service';
import { TherapistWithSchedule, User, UserService } from '@/types/user';
import { Key, useEffect, useMemo, useState, useTransition } from 'react';
import { Item, SortDirection } from 'react-stately';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DatePicker from '@/components/inputs/DatePicker';
import { ZodError, z } from 'zod';
import { CalendarDate, today } from '@internationalized/date';
import ComboBox from '@/components/inputs/ComboBox';
import Image from 'next/image';
import CancelConfirmationModal from '@/components/shared/modals/CancelConfirmationModal';
import { clinicRoutes } from '@/lib/routes';
import { nonUnselectedMessage } from '@/lib/validations';
import { useRouter } from 'next/navigation';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Dialog from '@/components/modal/Dialog';
import axios from 'axios';
import { sendEmail } from '@/services/messages';
import { renderToStaticMarkup } from 'react-dom/server';
import EmailLayout from '@/emails/EmailLayout';
import { editAppointment } from '@/services/appointment';

interface IEditView {
   appointment: Appointment;
   appointments: Appointment[];
   patient: User;
   submittedForms: SubmittedFile[];
   forms: IFile[];
   service: Service;
   headquarter: Headquarter;
   userServices: UserService[];
   therapists: TherapistWithSchedule[];
}

export default function EditView({
   appointment,
   forms,
   headquarter,
   patient,
   service,
   submittedForms,
   userServices,
   therapists,
   appointments,
}: IEditView) {
   const { hours } = useAppSelector(store => store.catalogues);
   const clinic = useAppSelector(store => store.clinic);

   const phoneCode = usePhoneCode();
   const clinicCurrency = useClinicCurrency();

   const [values, setValues] = useState(appointment);
   const valuesDate = useMemo(() => new Date(values.date), [values.date]);

   const directionState = useState<SortDirection>('ascending');
   const columnState = useState<Key>();
   const [sortedForms, setSortedForms] = useState(forms);

   const [isEditing, setIsEditing] = useState(false);
   const [isClosing, setIsClosing] = useState(false);

   const [editionError, setEditionError] = useState<string>();
   const [errors, setErrors] = useState<ZodError['errors']>();

   const [randomTherapist, setRandomTherapist] = useState<number>();
   const [cardTherapist, setCardTherapist] = useState(true);

   const [edited, setEdited] = useState(false);

   const [_, startTransition] = useTransition();

   function sort(direction: string, column: Key | undefined) {
      const aux = [...forms];

      aux.sort((data1, data2) => {
         const first = direction === 'ascending' ? data1 : data2,
            sec = direction === 'ascending' ? data2 : data1;

         switch (column) {
            case 'public_name':
               return first.public_name.localeCompare(sec.public_name);
            case 'state':
               return (
                  Number(
                     submittedForms.some(form => form.form_id === first.id),
                  ) -
                  Number(submittedForms.some(form => form.form_id === sec.id))
               );

            default:
               return data2.id - data1.id;
         }
      });

      setSortedForms(aux);
   }

   const filteredTherapists = useMemo(() => {
      const aux = userServices.filter(
         ({ service_id }) =>
            service_id.toString() === values.service_id.toString(),
      );

      return therapists.filter(({ user: { id } }) =>
         aux.some(({ user_id }) => id === user_id),
      );
   }, [userServices, therapists, values.service_id]);

   const selectedTherapist = useMemo(
      () =>
         filteredTherapists.find(
            ({ user: { id } }) =>
               id.toString() === values.therapist_id.toString(),
         ),
      [values.therapist_id, filteredTherapists],
   );

   const valuesSchema = z.object({
      date: z.string().nonempty(nonUnselectedMessage),
      hour: z.number({ invalid_type_error: nonUnselectedMessage }),
   });

   async function edit() {
      if (isEditing) return;

      setIsEditing(true);
      setEditionError(undefined);

      try {
         await editAppointment(clinic.slug, {
            ...values,
            therapist_id:
               values.therapist_id === -1 && randomTherapist
                  ? Number(randomTherapist)
                  : Number(values.therapist_id),
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
                        new Date(aux.date),
                     )}{' '}
                     a las {hours.find(({ code }) => aux.hour === code)?.name}.
                  </p>
               </EmailLayout>,
            ),
            destinationEmails: [patient.email],

            fromEmail: 'agenda.ahora.dvp@gmail.com',
            subject: `Reagendamiento de cita - ${clinic.name}`,
         });

         setEdited(true);
      } catch (error) {
         setEditionError('Ocurrió un error inesperado.');
         setIsEditing(false);
      }
   }

   useEffect(() => {
      values.therapist_id === -1 &&
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
                                 (day === 7 ? 0 : day) === valuesDate.getDay(),
                           ) &&
                           !appointments.some(
                              ({ date, hour, therapist_id }) =>
                                 therapist_id === user.id &&
                                 isSameDay(valuesDate, new Date(date)) &&
                                 hour.toString() === values.hour.toString(),
                           ),
                     ),
                  )?.user.id,
            ),
         );
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [values.hour]);

   useEffect(() => {
      sort(directionState[0], columnState[0]);

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [...directionState, ...columnState, forms]);

   function dateToCalendarDate(date: Date) {
      return new CalendarDate(
         date.getFullYear(),
         date.getMonth() + 1,
         date.getDate(),
      );
   }

   return (
      <>
         <SuccessModal id={appointment.id} isOpen={edited} slug={clinic.slug} />
         <CancelConfirmationModal
            isOpen={isClosing}
            setIsOpen={setIsClosing}
            route={
               clinicRoutes(clinic.slug).receptionist_appointments_id(
                  appointment.id,
               ).details
            }
         />
         <div className="grid h-max gap-10">
            <div className="flex items-center justify-between">
               <h3 className="text-xl">Información de la reserva</h3>
               <div className="flex flex-wrap justify-end gap-5 justify-self-end">
                  <Button
                     className="h-min w-max !px-12"
                     variant={Variant.secondary}
                     isDisabled={isEditing}
                     onPress={() => setIsClosing(true)}
                  >
                     Cancelar
                  </Button>
                  <Button
                     isDisabled={isEditing}
                     onPress={() => {
                        setErrors(undefined);

                        const parsing = valuesSchema.safeParse(values);

                        !parsing.success
                           ? setErrors(parsing.error.errors)
                           : edit();
                     }}
                     className="h-min w-max !px-12"
                  >
                     {isEditing ? (
                        <>
                           Cargando...
                           <RefreshRoundedIcon className="animate-spin" />
                        </>
                     ) : (
                        'Guardar'
                     )}
                  </Button>
                  {editionError && (
                     <div className="w-full flex-none text-end text-error">
                        {editionError}
                     </div>
                  )}
               </div>
            </div>
            <section className="mx-24 grid grid-cols-2 gap-5">
               <div>
                  <p className="mb-2 font-semibold">Servicio</p>
                  <p className="text-on-background-text">{service.name}</p>
               </div>
               <div>
                  <p className="mb-2 font-semibold">Estado de la atención</p>
                  <div className="w-max text-on-background-text">
                     <AppointmentStateChip state={appointment.state} />
                  </div>
               </div>
               <div>
                  <p className="mb-2 font-semibold">Fecha</p>
                  <DatePicker
                     errorMessage={
                        errors?.find(error => error.path.at(0) === 'date')
                           ?.message
                     }
                     isDateUnavailable={date =>
                        values.therapist_id === -1
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
                     value={(() => dateToCalendarDate(valuesDate))()}
                     onChange={val => {
                        val &&
                           setValues(prev => ({
                              ...prev,
                              date: val.toDate(timezone).toString(),
                              hour: NaN,
                           }));
                     }}
                  />
               </div>
               <div>
                  <p className="mb-2 font-semibold">Hora</p>
                  <ComboBox
                     placeholder="Selecciona un horario"
                     selectedKey={values.hour.toString()}
                     onSelectionChange={val => {
                        val &&
                           setValues(prev => ({ ...prev, hour: Number(val) }));
                     }}
                     errorMessage={
                        errors?.find(error => error.path.at(0) === 'hour')
                           ?.message
                     }
                  >
                     {[...hours]
                        .sort((a, b) => Number(a.code) - Number(b.code))
                        .filter(
                           ({ code }) =>
                              (isSameDay(valuesDate, new Date())
                                 ? Number(code) > new Date().getHours()
                                 : true) &&
                              !appointments.some(
                                 ({ date, hour, patient_id }) =>
                                    patient_id === values.patient_id &&
                                    isSameDay(valuesDate, new Date(date)) &&
                                    hour.toString() === code.toString(),
                              ) &&
                              (values.therapist_id === -1
                                 ? filteredTherapists
                                      .filter(
                                         ({ user: { headquarter_id } }) =>
                                            headquarter_id ===
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
                                                     new Date(
                                                        values.date,
                                                     ).getDay(),
                                               ) &&
                                               !appointments.some(
                                                  ({
                                                     date,
                                                     hour,
                                                     therapist_id,
                                                  }) =>
                                                     therapist_id === user.id &&
                                                     isSameDay(
                                                        valuesDate,
                                                        new Date(date),
                                                     ) &&
                                                     hour.toString() ===
                                                        code.toString(),
                                               ),
                                         ),
                                      )
                                 : !appointments.some(
                                      ({ date, hour, therapist_id }) =>
                                         therapist_id === values.therapist_id &&
                                         isSameDay(
                                            valuesDate,
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
                                               valuesDate.getDay(),
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
               </div>
               <div>
                  <p className="mb-2 font-semibold">Precio</p>
                  <p className="text-on-background-text">
                     {formatPrice(Number(appointment.price), clinicCurrency)}
                  </p>
               </div>
               <div>
                  <p className="mb-2 font-semibold">Lugar del servicio</p>
                  <p className="text-on-background-text">
                     {headquarter.name} -{' '}
                     {headquarter.index > 0
                        ? `Sede ${headquarter.index + 1}`
                        : 'Sede principal'}
                  </p>
               </div>
            </section>
            <h3 className="text-xl">Información del paciente</h3>
            <section className="mx-24">
               <UserOverviewCard code={phoneCode} user={patient} />
            </section>
            <h3 className="text-xl">Información del terapeuta</h3>
            <section className="mx-24">
               {cardTherapist && selectedTherapist ? (
                  <UserOverviewCard
                     user={selectedTherapist.user}
                     code={phoneCode}
                     extra={
                        <Button
                           className="!bg-transparent !py-0 !text-secondary"
                           aria-label="change therapist"
                           onPress={() => setCardTherapist(false)}
                        >
                           Cambiar
                        </Button>
                     }
                  />
               ) : (
                  <ComboBox
                     placeholder="Selecciona un terapeuta"
                     selectedKey={values.therapist_id?.toString()}
                     onSelectionChange={val => {
                        if (val) {
                           setValues(prev => ({
                              ...prev,
                              therapist_id: Number(val),
                              hour: NaN,
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
                                 <p className="text-lg">Cualquier terapeuta</p>
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
            </section>
            <h3 className="text-xl opacity-50">Documentos adjuntos</h3>
            <section className="mx-24 grid gap-5 opacity-50">
               <SubmittedFormsTable
                  columnState={columnState}
                  directionState={directionState}
                  forms={sortedForms}
                  submittedForms={submittedForms}
               />
            </section>
         </div>
      </>
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
   const router = useRouter();

   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="flex flex-col items-center gap-9 rounded-xl p-8 sm:p-14">
               <CheckCircleRoundedIcon className="!text-8xl text-primary" />
               <div>
                  <h3 className="mb-3 text-center text-xl">
                     Tus cambios se han guardado
                  </h3>
                  <p className="text-center !font-normal text-on-background-text body-1">
                     Tu y paciente podrán ver los datos actualizados en el
                     detalle de la cita
                  </p>
               </div>
               <Button
                  href={
                     clinicRoutes(slug).receptionist_appointments_id(id).details
                  }
                  className="!w-max !px-24"
               >
                  Continuar
               </Button>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
