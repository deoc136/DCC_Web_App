'use client';

import Dialog from '@/components/modal/Dialog';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Button from '@/components/shared/Button';
import { changeTitle } from '@/lib/features/title/title_slice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux-hooks';
import useDictionary from '@/lib/hooks/useDictionary';
import { clinicRoutes } from '@/lib/routes';
import { createRating } from '@/services/rating';
import { Appointment } from '@/types/appointment';
import { Service } from '@/types/service';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { useRouter } from 'next/navigation';
import { Dispatch, useEffect, useState } from 'react';

interface IRatingView {
   appointment: Appointment;
   service: Service;
}

export default function RatingView({ appointment, service }: IRatingView) {
   const dic = useDictionary();

   const initialValues = {
      quality: {
         label: dic.pages.patient.appointments.rating.labels.quality,
         value: 0,
      },
      punctuality: {
         label: dic.pages.patient.appointments.rating.labels.punctuality,
         value: 0,
      },
      kindness: {
         label: dic.pages.patient.appointments.rating.labels.kindness,
         value: 0,
      },
      knowledge: {
         label: dic.pages.patient.appointments.rating.labels.knowledge,
         value: 0,
      },
   };

   const clinic = useAppSelector(store => store.clinic);

   const dispatch = useAppDispatch();

   const [values, setValues] = useState(initialValues);

   const [isSending, setIsSending] = useState(false);
   const [isSent, setIsSent] = useState(false);

   const [error, setError] = useState<string>();

   async function edit() {
      if (isSending) return;

      setIsSending(true);
      setError(undefined);

      try {
         await createRating(clinic.slug, {
            kindness: values.kindness.value,
            knowledge: values.knowledge.value,
            punctuality: values.punctuality.value,
            quality: values.quality.value,
            appointment_id: appointment.id,
            patient_id: appointment.patient_id,
            therapist_id: appointment.therapist_id,
         });

         setIsSent(true);
      } catch (error) {
         setError(dic.texts.errors.unexpected_error);
         setIsSending(false);
      }
   }

   useEffect(() => {
      dispatch(
         changeTitle({
            goBackRoute: clinicRoutes(clinic.slug).patient_appointments_id(
               appointment.id,
            ).details,
            value: `${dic.texts.appointments.appointments_history} / ${service.name} / ${dic.texts.appointments.rate_service}`,
         }),
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [dispatch, appointment, dic]);

   useEffect(() => {
      setValues(prev => {
         const aux = { ...initialValues };

         Object.entries(prev).forEach(([key, { value }]) => {
            aux[key as keyof typeof initialValues].value = value;
         });

         return aux;
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [dic.language]);

   return (
      <>
         <SuccessModal id={appointment.id} isOpen={isSent} />
         <div className="grid min-h-full grid-rows-[1fr_auto] gap-10 text-sm lg:text-base">
            <div className="grid h-max gap-7">
               <h2 className="text-lg font-semibold lg:text-xl">
                  {dic.pages.patient.appointments.rating.title}
               </h2>
               <p className="text-on-background-text">
                  {dic.pages.patient.appointments.rating.description}
               </p>
               <h3 className="mb-5 text-base font-semibold lg:text-lg">
                  {dic.pages.patient.appointments.rating.sub_title}
               </h3>
               <section className="grid gap-9 sm:grid-cols-2 sm:gap-5">
                  {Object.entries(values).map(([key, { label, value }]) => (
                     <RatingSelector
                        key={key}
                        prop={key}
                        setValues={setValues}
                        value={value}
                        label={label}
                     />
                  ))}
               </section>
            </div>
            <div className="flex w-full flex-col gap-2 justify-self-end md:w-max">
               {error && (
                  <div className="w-full flex-none text-end text-error">
                     {error}
                  </div>
               )}
               <Button
                  className="justify-self-end md:!w-max md:!px-16"
                  isDisabled={
                     isSending ||
                     Object.values(values).some(({ value }) => value === 0)
                  }
                  onPress={edit}
               >
                  {isSending ? (
                     <>
                        {dic.texts.flows.loading}...
                        <RefreshRounded className="animate-spin" />
                     </>
                  ) : (
                     'Enviar formulario'
                  )}
               </Button>
            </div>
         </div>
      </>
   );
}

interface IRatingSelector {
   prop: string;
   value: number;
   setValues: Dispatch<any>;
   label: string;
}

function RatingSelector({ prop, setValues, value, label }: IRatingSelector) {
   const dic = useDictionary();

   function getValueText() {
      switch (value) {
         case 1:
            return dic.pages.patient.appointments.rating.ratings.very_bad;
         case 2:
            return dic.pages.patient.appointments.rating.ratings.bad;
         case 3:
            return dic.pages.patient.appointments.rating.ratings.regular;
         case 4:
            return dic.pages.patient.appointments.rating.ratings.good;
         case 5:
            return dic.pages.patient.appointments.rating.ratings.very_good;
         default:
            return '';
      }
   }

   return (
      <div className="grid gap-7 sm:grid-cols-[auto_1fr] sm:gap-4">
         <p className="font-semibold sm:col-span-full">{label}</p>
         {value > 0 && (
            <p className="self-center text-center font-semibold text-on-background-text sm:order-2 sm:text-start ">
               {getValueText()}
            </p>
         )}
         <div className="relative flex w-max justify-self-center sm:self-auto">
            {Array.from({ length: 5 }).map((_, i) => (
               <Button
                  key={i}
                  className="h-max w-full bg-transparent !p-0"
                  onPress={() =>
                     setValues((prev: any) => ({
                        ...prev,
                        [prop]: {
                           label,
                           value: i + 1,
                        },
                     }))
                  }
               >
                  <StarRoundedIcon
                     className={`!text-4xl sm:!text-3xl ${
                        i + 1 > value
                           ? '!fill-on-background-disabled'
                           : '!fill-star'
                     }`}
                  />
               </Button>
            ))}
         </div>
      </div>
   );
}

function SuccessModal({ isOpen, id }: { isOpen: boolean; id: number }) {
   const dic = useDictionary();

   const router = useRouter();

   const { slug } = useAppSelector(store => store.clinic);

   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="flex flex-col items-center gap-9 rounded-xl p-8 sm:p-14">
               <CheckCircleRoundedIcon className="!text-7xl text-primary lg:!text-8xl" />
               <h3 className="mb-3 text-center text-base lg:text-xl">
                  {dic.pages.patient.appointments.rating.success_modal.title}
               </h3>
               <Button
                  onPress={() => {
                     router.refresh();
                     router.push(
                        clinicRoutes(slug).patient_appointments_id(id).details,
                     );
                  }}
                  className="!w-max !px-24"
               >
                  {dic.texts.flows.understood}
               </Button>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
