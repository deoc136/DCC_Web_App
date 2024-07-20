'use client';

import Sidebar from '@/components/sidebar/Sidebar';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import { clinicRoutes } from '@/lib/routes';
import { Item } from 'react-stately';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import useDictionary from '@/lib/hooks/useDictionary';

interface IPatientAppointmentsSidebar {}

export default function PatientAppointmentsSidebar({}: IPatientAppointmentsSidebar) {
   const dic = useDictionary();

   const clinic = useAppSelector(store => store.clinic);

   const pathname = usePathname();

   const [hide, setHide] = useState(pathname.includes('edit'));

   useEffect(() => {
      setHide(pathname.includes('edit'));
   }, [pathname]);

   return (
      <Sidebar
         className={`hidden !h-max max-w-none bg-transparent !p-0 !pb-10 ${
            !hide && 'lg:block'
         }`}
         noImage
         icons={[CalendarMonthRoundedIcon, HistoryRoundedIcon]}
      >
         <Item
            textValue={clinicRoutes(clinic.slug).patient_appointments_actives}
         >
            {dic.texts.appointments.active_appointments}
         </Item>
         <Item
            textValue={clinicRoutes(clinic.slug).patient_appointments_history}
         >
            {dic.texts.appointments.appointments_history}
         </Item>
         <Item textValue="#">{true}</Item>
      </Sidebar>
   );
}
