'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import esLocale from '@fullcalendar/core/locales/es';
import { AppointmentWithNames } from '@/types/appointment';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import { ClinicRoute, clinicRoutes } from '@/lib/routes';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import { createRoot } from 'react-dom/client';
import { cutFullName } from '@/lib/utils';
import { useHover } from 'react-aria';

interface IAppointmentsCalendar {
   appointments: AppointmentWithNames[];
   redirectionUrl: (id: number) => ClinicRoute;
}

export default function AppointmentsCalendar({
   appointments,
   redirectionUrl,
}: IAppointmentsCalendar) {
   const [viewStyle, setViewStyle] = useState('timeGridDay');

   const { slug } = useAppSelector(store => store.clinic);

   const [prevButton, setPrevButton] = useState<Element | null>(null);
   const [nextButton, setNextButton] = useState<Element | null>(null);

   function findAppointment(id: string) {
      return appointments.find(
         ({ appointment: { id: $id } }) => $id.toString() === id,
      );
   }
   useEffect(() => {
      setPrevButton(document.querySelector('.fc-prev-button') ?? null);
      setNextButton(document.querySelector('.fc-next-button') ?? null);
   }, []);

   useEffect(() => {
      if (prevButton) {
         const root = createRoot(prevButton);

         root.render(
            <ChevronLeftRoundedIcon className="!fill-on-background-text !text-2xl sm:!text-5xl" />,
         );
      }
      if (nextButton) {
         const root = createRoot(nextButton);

         root.render(
            <ChevronRightRoundedIcon className="!fill-on-background-text !text-2xl sm:!text-5xl" />,
         );
      }
   }, [prevButton, nextButton]);

   return (
      <div className="w-full max-w-[calc(100vw-3rem)] overflow-x-auto overflow-y-visible px-1">
         <div className="min-w-[calc(800px)]">
            <FullCalendar
               locale={esLocale}
               plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
               headerToolbar={{
                  left: 'prev title next timeGridDay,timeGridWeek,dayGridMonth',
                  center: '',
                  right: '',
               }}
               buttonText={{
                  prev: ' ',
                  next: ' ',
               }}
               customButtons={{
                  prevCustomButton: {
                     icon: 'chevron-left',
                  },
               }}
               dayHeaderFormat={{
                  weekday: 'long',
                  day: viewStyle !== 'dayGridMonth' ? 'numeric' : undefined,
               }}
               titleFormat={{
                  month: 'long',
                  year: 'numeric',
               }}
               slotLabelFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  omitZeroMinute: false,
                  meridiem: 'short',
                  hour12: true,
               }}
               slotMinTime="06:00"
               initialView="timeGridDay"
               viewDidMount={e => setViewStyle(e.view.type)}
               allDaySlot={false}
               slotLabelClassNames="text-on-background-text"
               eventContent={e => {
                  const aux = findAppointment(e.event.title);

                  if (aux) {
                     return renderEventContent({
                        ...aux,
                        type: viewStyle,
                        url: redirectionUrl(aux.appointment.id),
                     });
                  } else {
                     return undefined;
                  }
               }}
               nowIndicator={false}
               dayHeaderClassNames="!border-0 !border-b"
               eventClassNames={e =>
                  `rounded shadow cursor-pointer transition !overflow-visible h-max relative hover:z-20 truncate ${
                     findAppointment(e.event.title)?.appointment.state ===
                     'TO_PAY'
                        ? 'bg-foundation'
                        : 'bg-primary-200'
                  }`
               }
               eventClick={e => e}
               events={appointments.map(({ appointment }) => {
                  const start = new Date(appointment.date);

                  start.setHours(Number(appointment.hour));

                  const end = new Date(appointment.date);

                  end.setHours(Number(appointment.hour) + 1);

                  return {
                     title: appointment.id.toString(),
                     start,
                     end,
                     resourceId: appointment.id,
                  };
               })}
            />
         </div>
      </div>
   );
}

interface renderEventContentProps extends AppointmentWithNames {
   type: string;
   url: ClinicRoute;
}

function renderEventContent(props: renderEventContentProps) {
   return <CalendarCell {...props} />;
}

function CalendarCell({
   url,
   data,
   type,
   appointment,
}: renderEventContentProps) {
   const { hoverProps, isHovered } = useHover({});

   return (
      <>
         {isHovered && (
            <Link
               {...hoverProps}
               href={url}
               className={`absolute top-0 z-10 h-max w-max min-w-full cursor-pointer truncate rounded px-3 py-2 shadow transition ${
                  appointment.state === 'TO_PAY'
                     ? 'bg-foundation'
                     : 'bg-primary-200'
               }`}
            >
               <p className="truncate font-semibold text-black">
                  {data.service_name}
               </p>
               <div>
                  <p className="truncate font-semibold text-black">Paciente:</p>
                  <p className="truncate text-black">
                     {cutFullName(data.patient_names, data.patient_last_names)}
                  </p>
               </div>
               <div>
                  <p className="truncate font-semibold text-black">
                     Terapeuta:
                  </p>
                  <p className="truncate text-black">
                     {cutFullName(
                        data.therapist_names,
                        data.therapist_last_names,
                     )}
                  </p>
               </div>
            </Link>
         )}
         <Link
            {...hoverProps}
            href={url}
            className="relative grid h-max gap-2 overflow-visible px-3 py-2"
         >
            <p className="truncate font-semibold text-black">
               {data.service_name}
            </p>
         </Link>
      </>
   );
}
