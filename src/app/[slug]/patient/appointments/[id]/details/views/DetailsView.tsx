'use client';

import Button, { Variant } from '@/components/shared/Button';
import UserOverviewCard from '@/components/shared/cards/UserOverviewCard';
import { changeTitle } from '@/lib/features/title/title_slice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux-hooks';
import usePhoneCode from '@/lib/hooks/usePhoneCode';
import { clinicRoutes } from '@/lib/routes';
import {
   paypalInvoiceUrl,
   secondsToTimeExtended,
   translateAppointmentAssistance,
   translateAppointmentState,
} from '@/lib/utils';
import { Appointment } from '@/types/appointment';
import { Headquarter } from '@/types/headquarter';
import { Service } from '@/types/service';
import { User } from '@/types/user';
import Image from 'next/image';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import { useRouter } from 'next/navigation';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Dialog from '@/components/modal/Dialog';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import {
   AddLinkRounded,
   ClearRounded,
   InsertLinkRounded,
   RefreshRounded,
} from '@mui/icons-material';
import { cancelAppointmentById, editAppointment } from '@/services/appointment';
import { sendEmail } from '@/services/messages';
import { renderToStaticMarkup } from 'react-dom/server';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import EmailLayout from '@/emails/EmailLayout';
import { convertCurrencyToUSD } from '@/services/currency';
import { createInvoice } from '@/services/invoice';
import useClinicCurrency from '@/lib/hooks/useClinicCurrency';
import useDictionary from '@/lib/hooks/useDictionary';

interface IDetailsView {
   therapist: User;
   service: Service;
   headquarter: Headquarter;
   appointment: Appointment;
   isRated: boolean;
}

export default function DetailsView({
   appointment,
   headquarter,
   service,
   therapist,
   isRated,
}: IDetailsView) {
   const dic = useDictionary();

   const { slug, cancelation_hours } = useAppSelector(store => store.clinic);

   const dispatch = useAppDispatch();

   const isClosed = ['CANCELED', 'CLOSED'].some(
      state => appointment.state === state,
   );

   const hours = useAppSelector(store => store.catalogues.hours);

   const code = usePhoneCode();

   useEffect(() => {
      dispatch(
         changeTitle({
            goBackRoute: isClosed
               ? clinicRoutes(slug).patient_appointments_history
               : clinicRoutes(slug).patient_appointments_actives,
            value: isClosed
               ? `${dic.texts.appointments.appointments_history} / ${service.name}`
               : `${dic.texts.appointments.active_appointments} / ${service.name}`,
         }),
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [dispatch, appointment, dic]);

   const allowEdition = useMemo(() => {
      const aux = new Date(appointment.date);

      aux.setHours(appointment.hour);

      const sus = aux.getTime() - new Date().getTime();

      return sus > 0 && sus > cancelation_hours * 3600000;
   }, [cancelation_hours, appointment.hour, appointment.date]);

   return (
      <div className="grid gap-5 text-sm md:grid-cols-7 lg:grid-cols-1 lg:text-base xl:grid-cols-5 xl:gap-10">
         <section className="relative aspect-[350/254] w-full overflow-hidden rounded-lg md:col-span-3 xl:col-span-2">
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
         </section>
         <section className="grid gap-5 md:col-span-4 xl:col-span-3">
            <h2 className="text-base font-semibold text-black lg:text-lg">
               {service.name}
            </h2>
            <section className="grid grid-cols-2 gap-3 text-xs text-on-background-text lg:text-sm">
               <div className="order-1">
                  <p className="mb-2 font-semibold">
                     {dic.texts.attributes.date}:
                  </p>
                  <p>
                     {(date => {
                        return `${Intl.DateTimeFormat(dic.language, {
                           month: 'long',
                        }).format(
                           date,
                        )} ${date.getDate()} ${date.getFullYear()}`;
                     })(new Date(appointment.date))}
                  </p>
               </div>
               <div className="order-3">
                  <p className="mb-2 font-semibold">
                     {dic.texts.attributes.duration}:
                  </p>
                  <p>
                     {secondsToTimeExtended(
                        Number(service.service_duration),
                        dic,
                     )}
                  </p>
               </div>
               <div className="order-4">
                  <p className="mb-2 font-semibold">
                     {dic.texts.attributes.hour}:
                  </p>
                  <p>
                     {(hour => hour?.name)(
                        hours.find(
                           ({ code }) =>
                              Number(code) === Number(appointment.hour),
                        ),
                     )}{' '}
                     -{' '}
                     {(hour => (hour ? hour.name : '11:00 PM'))(
                        hours.find(
                           ({ code }) =>
                              Number(code) === Number(appointment.hour) + 1,
                        ),
                     )}
                  </p>
               </div>
               {!isClosed && (
                  <div className="order-5">
                     <p className="mb-2 font-semibold">
                        {dic.texts.attributes.payment_state}:
                     </p>
                     <p>
                        {appointment.state === 'PENDING'
                           ? 'Pagado'
                           : 'Por pagar'}
                     </p>
                  </div>
               )}
               <div className="order-6 col-span-2 md:order-2 md:col-span-1">
                  <p className="mb-2 font-semibold">
                     {dic.texts.attributes.address}:
                  </p>
                  <p>{headquarter.address}</p>
               </div>
            </section>
            <div className="hidden grid-cols-2 gap-5 md:grid">
               <Buttons
                  isRated={isRated}
                  allowEdition={allowEdition}
                  isClosed={isClosed}
                  appointment={appointment}
                  service={service}
               />
            </div>
         </section>
         <section className="md:col-span-full">
            <p className="mb-2 font-semibold">
               {dic.texts.attributes.description}:
            </p>
            <p className="text-on-background-text">{service.description}</p>
         </section>
         <section className="max-w-screen-lg md:col-span-full">
            <p className="mb-2 font-semibold">
               {dic.texts.attributes.therapist}:
            </p>
            <UserOverviewCard code={code} user={therapist} />
         </section>
         <div className="mt-3 grid gap-5 sm:grid-cols-2 md:hidden">
            <Buttons
               isRated={isRated}
               allowEdition={allowEdition}
               isClosed={isClosed}
               appointment={appointment}
               service={service}
            />
         </div>
      </div>
   );
}

interface IButtons {
   isClosed: boolean;
   appointment: Appointment;
   allowEdition: boolean;
   service: Service;
   isRated: boolean;
}

function Buttons({
   isClosed,
   appointment,
   allowEdition,
   service,
   isRated,
}: IButtons) {
   const dic = useDictionary();

   const [disabledOpen, setDisabledOpen] = useState(false);

   const router = useRouter();

   const clinic = useAppSelector(store => store.clinic);
   const hours = useAppSelector(store => store.catalogues.hours);
   const user = useAppSelector(store => store.user);

   const currency = useClinicCurrency();

   const [canceling, setCanceling] = useState(false);
   const [cancelOpen, setCancelOpen] = useState(false);

   const [generating, setGenerating] = useState(false);

   const [errorCanceling, setErrorCanceling] = useState(false);

   async function cancelAppointment() {
      if (canceling || !allowEdition) return;

      setCanceling(true);

      try {
         appointment.state === 'PENDING'
            ? await cancelAppointmentById(clinic.slug, appointment.id)
            : await editAppointment(clinic.slug, {
                 ...appointment,
                 state: 'CANCELED',
              });

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
                     {
                        hours.find(
                           ({ code }) => appointment.hour.toString() === code,
                        )?.name
                     }{' '}
                     fue cancelada.
                  </p>
               </EmailLayout>,
            ),
            destinationEmails: user?.email ? [user.email] : [],

            fromEmail: 'agenda.ahora.dvp@gmail.com',
            subject: `Cancelación de cita - ${clinic.name}`,
         });

         router.refresh();
      } catch (error) {
         setCanceling(false);
         setCancelOpen(false);
         setErrorCanceling(true);
      }
   }

   async function generateLink() {
      if (!currency || generating) return;

      setGenerating(true);

      const {
         data: {
            rates: {
               USD: { rate_for_amount },
            },
         },
      } = await convertCurrencyToUSD(currency, Number(service.price));

      const aux = rate_for_amount.split('.');

      const { data } = await createInvoice(clinic.slug, {
         price: Number(`${aux[0]}.${aux[1].slice(0, 2) ?? 0}`),
         services_name: service.name,
         services_quantity: 1,
      });

      await editAppointment(clinic.slug, {
         ...appointment,
         invoice_id: data.id,
      });

      router.refresh();
   }

   return (
      <>
         <ErrorCancelingModal
            isOpen={errorCanceling}
            setIsOpen={setErrorCanceling}
         />
         {isClosed ? (
            <Button
               href={
                  clinicRoutes(clinic.slug).patient_appointments_id(
                     appointment.id,
                  ).rate
               }
               isDisabled={
                  appointment.state !== 'CLOSED' ||
                  appointment.assistance !== 'ATTENDED' ||
                  isRated
               }
               className={`!h-max ${
                  isRated &&
                  'flex items-center justify-center gap-2 border border-success bg-transparent !text-success'
               }`}
            >
               {appointment.state === 'CANCELED' ? (
                  translateAppointmentState(appointment.state, dic)
               ) : appointment.assistance === 'MISSED' ? (
                  translateAppointmentAssistance(appointment.assistance, dic)
               ) : isRated ? (
                  <>
                     <CheckCircleRoundedIcon className="!fill-success" />{' '}
                     {dic.texts.appointments.rated}
                  </>
               ) : (
                  dic.texts.appointments.rate_service
               )}
            </Button>
         ) : (
            <>
               <ConfirmCancelationModal
                  isOpen={cancelOpen}
                  loading={canceling}
                  cancel={cancelAppointment}
                  setIsOpen={setCancelOpen}
               />
               <EditionDisabledModal
                  isOpen={disabledOpen}
                  setIsOpen={setDisabledOpen}
               />
               <Button
                  className="flex !h-max items-center justify-center gap-2 !py-2"
                  variant={Variant.outlined}
                  onPress={() =>
                     allowEdition
                        ? router.push(
                             clinicRoutes(clinic.slug).patient_appointments_id(
                                appointment.id,
                             ).edit,
                          )
                        : setDisabledOpen(true)
                  }
               >
                  <RestartAltRoundedIcon /> {dic.texts.flows.change_date}
               </Button>
               <Button
                  className="!h-max !py-2"
                  isDisabled={appointment.from_package}
                  variant={Variant.secondary}
                  onPress={() =>
                     allowEdition ? setCancelOpen(true) : setDisabledOpen(true)
                  }
               >
                  {dic.texts.flows.cancel_appointment}
               </Button>
            </>
         )}
         {appointment.state === 'TO_PAY' &&
            appointment.payment_method === 'ONLINE' &&
            (appointment.invoice_id?.length ? (
               <Button
                  onPress={() => {
                     navigator.clipboard.writeText(
                        `${paypalInvoiceUrl}${appointment.invoice_id}`,
                     );
                  }}
                  className="col-span-full flex w-max items-center gap-1 bg-transparent !p-0 font-semibold !text-secondary"
               >
                  <InsertLinkRounded /> {dic.texts.flows.copy_payment_link}
               </Button>
            ) : (
               <Button
                  onPress={generateLink}
                  isDisabled={generating}
                  className="col-span-full flex w-max items-center gap-1 bg-transparent !p-0 font-semibold !text-secondary"
               >
                  {generating ? (
                     <>
                        {dic.texts.flows.loading}...
                        <RefreshRounded className="animate-spin" />
                     </>
                  ) : (
                     <>
                        <AddLinkRounded />{' '}
                        {dic.texts.flows.generate_payment_link}
                     </>
                  )}
               </Button>
            ))}
      </>
   );
}

interface IErrorCancelingModal {
   isOpen: boolean;
   setIsOpen: Dispatch<SetStateAction<boolean>>;
}

function ErrorCancelingModal({ isOpen, setIsOpen }: IErrorCancelingModal) {
   const dic = useDictionary();

   return (
      <ModalTrigger
         className="m-2 animate-appear text-sm sm:m-8 lg:text-base"
         isOpen={isOpen}
      >
         {() => (
            <Dialog className="flex flex-col items-center gap-9 rounded-xl p-8 sm:p-14">
               <InfoRoundedIcon className="!text-7xl text-primary lg:!text-8xl" />
               <div>
                  <h3 className="mb-3 text-center text-base lg:text-xl">
                     {dic.texts.errors.error}
                  </h3>
                  <p className="text-center !font-normal text-on-background-text">
                     {dic.texts.errors.excuse.part_1}
                     <br />
                     {dic.texts.errors.excuse.part_2}
                  </p>
               </div>
               <Button
                  onPress={() => setIsOpen(false)}
                  className="w-max !px-24"
               >
                  {dic.texts.flows.understood}
               </Button>
            </Dialog>
         )}
      </ModalTrigger>
   );
}

interface IEditionDisabledModal {
   isOpen: boolean;
   setIsOpen: Dispatch<SetStateAction<boolean>>;
}

function EditionDisabledModal({ isOpen, setIsOpen }: IEditionDisabledModal) {
   const dic = useDictionary();

   const { cancelation_hours } = useAppSelector(store => store.clinic);

   return (
      <ModalTrigger
         className="m-2 animate-appear text-sm sm:m-8 lg:text-base"
         isOpen={isOpen}
      >
         {() => (
            <Dialog className="flex flex-col items-center gap-9 rounded-xl p-8 sm:p-14">
               <InfoRoundedIcon className="!text-7xl text-primary lg:!text-8xl" />
               <div>
                  <h3 className="mb-3 text-center text-base lg:text-xl">
                     {
                        dic.pages.patient.appointments.reschedule
                           .unavailable_modal.title
                     }
                  </h3>
                  <p className="text-center !font-normal text-on-background-text">
                     {
                        dic.pages.patient.appointments.reschedule
                           .unavailable_modal.description_1
                     }{' '}
                     <br />
                     {
                        dic.pages.patient.appointments.reschedule
                           .unavailable_modal.description_2
                     }{' '}
                     {cancelation_hours}{' '}
                     {
                        dic.pages.patient.appointments.reschedule
                           .unavailable_modal.description_3
                     }
                     .
                  </p>
               </div>
               <Button
                  onPress={() => setIsOpen(false)}
                  className="w-max !px-24"
               >
                  {dic.texts.flows.understood}
               </Button>
            </Dialog>
         )}
      </ModalTrigger>
   );
}

interface IConfirmCancelationModal {
   cancel: () => Promise<void>;
   loading: boolean;
   isOpen: boolean;
   setIsOpen: Dispatch<SetStateAction<boolean>>;
}

function ConfirmCancelationModal({
   isOpen,
   cancel,
   loading,
   setIsOpen,
}: IConfirmCancelationModal) {
   const dic = useDictionary();

   return (
      <ModalTrigger
         className="m-2 animate-appear text-sm sm:m-8 lg:text-base"
         isOpen={isOpen}
      >
         {() => (
            <Dialog className="flex flex-col items-center gap-9 rounded-xl p-8 sm:p-14">
               <div className="aspect-square rounded-full bg-error p-3">
                  <ClearRounded className="!text-5xl text-white lg:!text-6xl" />
               </div>
               <h3 className="text-center text-base lg:text-xl">
                  {
                     dic.pages.patient.appointments.cancel_confirmation_modal
                        .title
                  }
               </h3>
               <div className="grid w-full grid-cols-2 gap-2 md:gap-5">
                  <Button
                     variant={Variant.secondary}
                     onPress={() => setIsOpen(false)}
                  >
                     {dic.texts.flows.back}
                  </Button>
                  <Button isDisabled={loading} onPress={cancel}>
                     {loading ? (
                        <>
                           {dic.texts.flows.loading}...
                           <RefreshRounded className="animate-spin" />
                        </>
                     ) : (
                        dic.texts.flows.cancel
                     )}
                  </Button>
               </div>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
