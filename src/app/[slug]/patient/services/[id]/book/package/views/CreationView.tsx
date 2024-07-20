'use client';

import CreationState from '@/components/shared/CreationState';
import { changeTitle } from '@/lib/features/title/title_slice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux-hooks';
import { clinicRoutes } from '@/lib/routes';
import { createDateAndReturnTime, formatPrice, timezone } from '@/lib/utils';
import {
   Appointment,
   AppointmentState,
   PaymentMethod,
} from '@/types/appointment';
import { Headquarter } from '@/types/headquarter';
import { Service } from '@/types/service';
import { TherapistWithSchedule, UserService } from '@/types/user';
import { CalendarDate, today } from '@internationalized/date';
import { useEffect, useState } from 'react';
import FormView from './FormView';
import { ZodError, z } from 'zod';
import Button, { Variant } from '@/components/shared/Button';
import { nonEmptyMessage, nonUnselectedMessage } from '@/lib/validations';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ReviewView from './ReviewView';
import PaymentView from './PaymentView';
import WarningModal from '../../components/WarningModal';
import { useRouter } from 'next/navigation';
import { createAppointment } from '@/services/appointment';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Dialog from '@/components/modal/Dialog';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import useClinicCurrency from '@/lib/hooks/useClinicCurrency';
import CancelConfirmationModal from '@/components/shared/modals/CancelConfirmationModal';
import { convertCurrencyToUSD } from '@/services/currency';
import { refundInvoice } from '@/services/invoice';
import useDictionary from '@/lib/hooks/useDictionary';
import { dividerClasses } from '@mui/material';

interface ICreationView {
   headquarters: Headquarter[];
   therapists: TherapistWithSchedule[];
   userServices: UserService[];
   appointments: Appointment[];
   service: Service;
   packageData: Package;
}

enum AppointmentCreationState {
   creation,
   review,
   payment,
}

export type NewAppointmentWithDate = typeof initialState;

export type ServiceOutline = typeof initialService & {
   random_therapist_id?: string;
};

const initialService = {
   date: today(timezone) as CalendarDate,
   hour: '',
   therapist_id: '',
};

const initialState = {
   headquarter_id: '',
   payment_method: 'ONLINE' as PaymentMethod,
   state: 'PENDING' as AppointmentState,
   services: [] as ServiceOutline[],
   payment_mount: '',
};

export default function CreationView({
   appointments,
   headquarters,
   service,
   therapists,
   userServices,
   packageData,
}: ICreationView) {
   const dic = useDictionary();

   const dispatch = useAppDispatch();

   const { slug } = useAppSelector(store => store.clinic);
   const patient = useAppSelector(store => store.user);

   const [state, setState] = useState(AppointmentCreationState.creation);

   const [values, setValues] = useState({
      ...initialState,
      services: Array.from({
         length: Number(packageData?.quantity ?? 0),
      }).map(_ => ({
         date: today(timezone),
         hour: '',
         therapist_id: '',
      })) as ServiceOutline[],
   });
   const [errors, setErrors] = useState<ZodError['errors']>();

   const [creating, setCreating] = useState(false);
   const [creationError, setCreationError] = useState<string>();

   const [closing, setClosing] = useState(false);

   const [created, setCreated] = useState(false);

   const [priceInUsd, setPriceInUsd] = useState<string>();

   const currency = useClinicCurrency();

   useEffect(() => {
      (async () => {
         if (
            state === AppointmentCreationState.payment &&
            priceInUsd === undefined &&
            currency !== undefined
         ) {
            const {
               data: {
                  rates: {
                     USD: { rate_for_amount },
                  },
               },
            } = await convertCurrencyToUSD(currency, Number(packageData.price));

            const aux = rate_for_amount.split('.');

            setPriceInUsd(`${aux[0]}.${aux[1].slice(0, 2) ?? 0}`);
         }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [currency, state]);

   const valuesSchema = z.object({
      headquarter_id: z.string().nonempty(nonUnselectedMessage),
      state: z.string().nonempty(nonEmptyMessage),
      payment_method: z.string().nonempty(nonUnselectedMessage),
      services: z.array(
         z.object({
            date: z.unknown({ required_error: nonEmptyMessage }),
            hour: z.string().nonempty(nonUnselectedMessage),
            therapist_id: z.string().nonempty(nonUnselectedMessage),
         }),
      ),
   });

   useEffect(() => {
      dispatch(
         changeTitle({
            goBackRoute: clinicRoutes(slug).patient_services_id(service.id)
               .details,
            value: `${dic.texts.services.services} / ${service.name} / ${dic.texts.services.book_package}`,
         }),
      );
   }, [dispatch, service.id, service.name, slug, dic]);

   const steps = [
      {
         name: dic.texts.services.book_your_appointment,
         state: AppointmentCreationState.creation,
      },
      {
         name: dic.texts.services.payment_summary,
         state: AppointmentCreationState.review,
      },
      {
         name: dic.texts.services.payment_method,
         state: AppointmentCreationState.payment,
      },
   ];

   async function create(order_id: string) {
      if (creating) return;

      setCreating(true);
      setCreationError(undefined);

      try {
         await Promise.all([
            ...values.services
               .sort(
                  (a, b) =>
                     createDateAndReturnTime(
                        a.date.toString(),
                        Number(a.hour),
                     ) -
                     createDateAndReturnTime(b.date.toString(), Number(b.hour)),
               )
               .map((service, i) =>
                  createAppointment(slug, {
                     date: service.date.toDate(timezone).toString(),
                     headquarter_id: Number(values.headquarter_id),
                     hour: Number(service.hour),
                     patient_id: patient?.id ?? 0,
                     payment_method: values.payment_method,
                     service_id: packageData.service_id,
                     therapist_id:
                        service.therapist_id === '-1' &&
                        service.random_therapist_id
                           ? Number(service.random_therapist_id)
                           : Number(service.therapist_id),
                     price: i === 0 ? packageData.price.toString() ?? '0' : '0',
                     state: values.state,
                     from_package: true,
                     order_id,
                     creation_date: new Date().toString(),
                  }),
               ),
         ]);

         setCreated(true);
      } catch (error) {
         try {
            await refundInvoice(slug, order_id);
         } catch (error) {}

         setCreationError('Ocurrió un error inesperado.');
         setCreating(false);
      }
   }

   return (
      <>
         <CancelConfirmationModal
            route={clinicRoutes(slug).patient_services_id(service.id).details}
            isOpen={closing}
            setIsOpen={setClosing}
         />
         <SuccessModal
            isOpen={created}
            id={service.id}
            slug={slug}
            serviceId={service.id}
         />
         <div className="grid gap-10 text-sm lg:text-base">
            <CreationState
               className="w-11/12 grid-cols-[auto_1fr_auto_1fr_auto]"
               steps={steps}
               state={state}
            />
            {state === AppointmentCreationState.creation ? (
               <FormView
                  appointments={appointments}
                  errors={errors}
                  headquarters={headquarters}
                  service={service}
                  setValues={setValues}
                  therapists={therapists}
                  userServices={userServices}
                  values={values}
                  patient={patient}
                  packageData={packageData}
               />
            ) : state === AppointmentCreationState.review ? (
               <ReviewView
                  service={service}
                  therapists={therapists}
                  values={values}
                  headquarters={headquarters}
               />
            ) : (
               <PaymentView
                  service={service}
                  create={create}
                  creating={creating}
                  priceInUsd={priceInUsd}
                  setCreationError={setCreationError}
                  packageData={packageData}
               />
            )}
            <div className="flex flex-col flex-wrap gap-5 lg:flex-row lg:justify-between">
               {creationError && (
                  <div className="w-full flex-none text-end text-error">
                     {creationError}
                  </div>
               )}
               <div
                  className={`${
                     state === AppointmentCreationState.review && 'grid-cols-2'
                  } grid gap-5 lg:order-1`}
               >
                  {state !== AppointmentCreationState.creation && (
                     <Button
                        className="flex items-center justify-center gap-2 lg:px-12"
                        isDisabled={creating}
                        onPress={() => {
                           if (creating) return;
                           switch (state) {
                              case AppointmentCreationState.review:
                                 setState(AppointmentCreationState.creation);
                                 break;
                              case AppointmentCreationState.payment:
                                 setState(AppointmentCreationState.review);
                                 break;
                           }
                        }}
                        variant={Variant.secondary}
                     >
                        <ArrowBackRoundedIcon />
                        {dic.texts.flows.previous}
                     </Button>
                  )}
                  {state !== AppointmentCreationState.payment && (
                     <Button
                        className="flex items-center justify-center gap-2 lg:px-12"
                        isDisabled={creating}
                        onPress={() => {
                           setErrors(undefined);
                           if (creating) return;

                           switch (state) {
                              case AppointmentCreationState.creation:
                                 const valuesParsing =
                                    valuesSchema.safeParse(values);

                                 valuesParsing.success
                                    ? setState(AppointmentCreationState.review)
                                    : setErrors(valuesParsing.error.errors);
                                 break;
                              case AppointmentCreationState.review:
                                 setState(AppointmentCreationState.payment);
                                 break;
                           }
                        }}
                     >
                        {(() => {
                           if (creating) {
                              return (
                                 <>
                                    {dic.texts.flows.loading}...
                                    <RefreshRoundedIcon className="animate-spin" />
                                 </>
                              );
                           } else {
                              switch (state) {
                                 case AppointmentCreationState.creation:
                                    return dic.texts.flows.continue;
                                 case AppointmentCreationState.review:
                                    return (
                                       <>
                                          {dic.texts.flows.next}
                                          <ArrowForwardRoundedIcon />
                                       </>
                                    );
                                 default:
                                    return dic.texts.flows.book_appointment;
                              }
                           }
                        })()}
                     </Button>
                  )}
               </div>
               <Button
                  onPress={() => {
                     if (creating) return;
                     setClosing(true);
                  }}
                  variant={Variant.secondary}
                  className="w-full bg-transparent shadow lg:w-max"
               >
                  {dic.texts.flows.cancel}
               </Button>
            </div>
         </div>
      </>
   );
}

function SuccessModal({
   slug,
   isOpen,
   id,
   serviceId,
}: {
   serviceId: number;
   slug: string;
   isOpen: boolean;
   id?: number;
}) {
   const dic = useDictionary();

   const router = useRouter();

   return (
      <ModalTrigger
         className="m-2 animate-appear text-sm sm:m-8 lg:text-base"
         isOpen={isOpen}
      >
         {() => (
            <Dialog className="flex  flex-col items-center gap-9 rounded-xl p-8 sm:p-14">
               <CheckCircleRoundedIcon className="!text-7xl text-primary lg:!text-8xl" />
               <div>
                  <h3 className="mb-3 text-center text-base lg:text-xl">
                     {
                        dic.pages.patient.services.book.success_modal_package
                           .title
                     }
                  </h3>
                  <p className="text-center  !font-normal text-on-background-text">
                     {
                        dic.pages.patient.services.book.success_modal_package
                           .description
                     }
                  </p>
               </div>
               <div className="grid w-full grid-cols-2 gap-5">
                  <Button
                     href={clinicRoutes(slug).patient_appointments_history}
                     variant={Variant.secondary}
                  >
                     {dic.texts.flows.see_appointments}
                  </Button>
                  <Button
                     onPress={() => {
                        if (!id) return;
                        router.push(
                           clinicRoutes(slug).patient_services_id(serviceId)
                              .details,
                        );
                     }}
                  >
                     {dic.texts.flows.end}
                  </Button>
               </div>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
